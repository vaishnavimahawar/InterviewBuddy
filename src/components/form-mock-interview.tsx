// Imports for UI/UX improvements
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  } from "@/components/ui/card"; // Corrected path
  import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  } from "@/components/ui/select"; // Corrected path
  import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"; // Corrected path
  // Original imports
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { FormProvider, useForm } from "react-hook-form";
  import { Interview } from "@/types";
  import { CustomBreadCrumb } from "./custom-bread-crumb";
  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "@clerk/clerk-react";
  import { toast } from "sonner";
  import { Button } from "./ui/button";
  import { Loader2, Trash2 } from "lucide-react"; // Using Loader2 for a better spinner
  import { Separator } from "./ui/separator";
  import {
  FormControl,
  FormDescription, // UI/UX Improvement: For helper text
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  } from "./ui/form";
  import { Input } from "./ui/input";
  import { Textarea } from "./ui/textarea";
  import { getChatSession } from "@/scripts";
  import {
  addDoc,
  collection,
  deleteDoc, // For delete functionality
  doc,
  serverTimestamp,
  updateDoc,
  } from "firebase/firestore";
  import { db } from "@/config/firebase.config";
  
  interface FormMockInterviewProps {
  initialData: Interview | null;
  }
  
  const formSchema = z.object({
  position: z
  .string()
  .min(1, "Position is required.")
  .max(100, "Position must be 100 characters or less."),
  description: z.string().min(10, "A brief description is required."),
  experience: z.coerce
  .number({ invalid_type_error: "Experience must be a number." })
  .min(0, "Experience cannot be negative."),
  techStack: z.string().min(1, "Please list the required tech stack."),
  numberOfQuestions: z.coerce
  .number()
  .min(1, "Must be at least 1.")
  .max(20, "Cannot exceed 20."),
  interviewType: z.enum(["technical", "behavioural", "mixed"], {
  required_error: "Please select an interview type.",
  }),
  });
  
  type FormData = z.infer<typeof formSchema>;
  
    export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
      position: "",
      description: "",
      experience: 0,
      techStack: "",
      numberOfQuestions: 5,
      interviewType: "technical",
      },
      });
  
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const { userId } = useAuth();
  
      const title = initialData ? "Edit Mock Interview" : "Create a New Mock Interview";
      const description = initialData
      ? `Editing the interview for the ${initialData.position} role.`
      : "Fill out the details below to generate your AI-powered mock interview.";
      const breadCrumpPage = initialData ? "Edit" : "Create";
      const actionLabel = initialData ? "Save Changes" : "Generate Interview";
      const toastMessage = initialData
      ? { title: "Interview Updated!", description: "Your changes have been saved." }
      : { title: "Interview Created!", description: "Your new mock interview is ready." };
  
      // AI generation logic remains the same...
      const cleanAiResponse = (responseText: string) => { // Step 1: Trim any surrounding whitespace
  
          let cleanText = responseText.trim();
  
  
  
          // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
  
          cleanText = cleanText.replace(/(json|```|`)/g, "");
  
  
  
          // Step 3: Extract a JSON array by capturing text between square brackets
  
          const jsonArrayMatch = cleanText.match(/\[.*\]/s);
  
          if (jsonArrayMatch) {
  
      cleanText = jsonArrayMatch[0];
  
          } else {
  
            throw new Error("No JSON array found in response");
  
          }
  
  
  
          // Step 4: Parse the clean JSON text into an array of objects
  
          try {
  
            return JSON.parse(cleanText);
  
          } catch (error) {
  
            throw new Error("Invalid JSON format: " + (error as Error)?.message);
  
          } };
      const generateAiResponse = async (data: FormData) => {
      // Check if API key is configured
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("API key not configured. Please check your environment variables.");
      }
  
      const prompt = `
  
      As an experienced prompt engineer, generate a JSON array containing ${data.numberOfQuestions} ${data.interviewType} interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:
  
  
  
      [
  
      { "question": "<Question text>", "answer": "<Answer text>" },
  
          ...
  
          ]
  
  
  
          Job Information:
  
          - Job Position: ${data?.position}
  
          - Job Description: ${data?.description}
  
          - Years of Experience Required: ${data?.experience}
  
          - Tech Stacks: ${data?.techStack}
  
          - Interview Type: ${data?.interviewType}
  
          - Number of Questions: ${data?.numberOfQuestions}
  
  
  
          ${data.interviewType === 'technical' ? `The questions should assess technical skills in ${data?.techStack} development, problem-solving, algorithms, data structures, and best practices.` : ''}
  
          ${data.interviewType === 'behavioural' ? `The questions should assess behavioral competencies, leadership, teamwork, problem-solving approaches, and past experiences.` : ''}
  
          ${data.interviewType === 'mixed' ? `The questions should be a mix of technical skills assessment in ${data?.techStack} development and behavioral competencies including leadership, teamwork, and problem-solving approaches.` : ''}
  
          ${data.experience == 0 ? 'Important: Since the required experience is 0, the questions must be very easy and short, suitable for an entry-level or fresher candidate. Focus on fundamental concepts only.' : ''}
  
          Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
  
          `;
  
          try {
          const aiResult = await getChatSession(prompt);
          const cleanedResponse = cleanAiResponse((aiResult as any).response.text());
          return cleanedResponse;
          } catch (error: any) {
          // Handle specific error types
          if (error?.status === 503) {
          if (error?.message?.includes("overloaded")) {
          throw new Error("Model is overloaded. The app will automatically retry with a different model.");
          } else {
          throw new Error("AI service is temporarily unavailable. Please try again in a few minutes.");
          }
          } else if (error?.status === 401) {
          throw new Error("Invalid API key. Please check your configuration.");
          } else if (error?.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
          } else if (error?.status === 400) {
          throw new Error("Invalid request. Please check your input and try again.");
          } else if (error?.message?.includes("timeout")) {
          throw new Error("Request timed out. The AI model is taking longer than expected to respond. Please try again.");
          } else {
          throw new Error(`AI service error: ${error?.message || 'Unknown error occurred'}`);
          }
          }
          };
  
          const onSubmit = async (data: FormData) => {
          try {
          setLoading(true);
  
          // Show a toast to inform users that AI generation might take time
          toast.info("Generating interview questions...", {
          description: "This may take up to 60 seconds. The AI model might be busy, so we'll retry if needed.",
          });
  
          const aiResult = await generateAiResponse(data);
  
          if (initialData) {
          await updateDoc(doc(db, "interviews", initialData.id), {
          ...data,
          questions: aiResult,
          updatedAt: serverTimestamp(),
          });
          } else {
          await addDoc(collection(db, "interviews"), {
          ...data,
          userId,
          questions: aiResult,
          createdAt: serverTimestamp(),
          status: 'pending',
          });
          }
  
          toast.success(toastMessage.title, { description: toastMessage.description });
          navigate("/generate", { replace: true });
  
          } catch (error: any) {
          console.error(error);
  
          // Provide more specific error messages based on the error type
          let errorMessage = "Something went wrong while generating questions. Please try again.";
          let errorDescription = "An unexpected error occurred.";
  
          if (error?.message) {
          if (error.message.includes("API key not configured")) {
          errorMessage = "Configuration Error";
          errorDescription = "Please check your API key configuration.";
          } else if (error.message.includes("temporarily unavailable")) {
          errorMessage = "Service Unavailable";
          errorDescription = "The AI service is temporarily down. Please try again in a few minutes.";
          } else if (error.message.includes("overloaded")) {
          errorMessage = "Model Overloaded";
          errorDescription = "The AI model is currently busy. The app will automatically retry with a different model.";
          } else if (error.message.includes("Invalid API key")) {
          errorMessage = "Authentication Error";
          errorDescription = "Please check your API key and try again.";
          } else if (error.message.includes("Rate limit exceeded")) {
          errorMessage = "Rate Limit Exceeded";
          errorDescription = "Too many requests. Please wait a moment before trying again.";
          } else if (error.message.includes("Invalid request")) {
          errorMessage = "Invalid Request";
          errorDescription = "Please check your input and try again.";
          } else if (error.message.includes("timed out")) {
          errorMessage = "Request Timeout";
          errorDescription = "The AI model is taking longer than expected. Please try again.";
          } else {
          errorMessage = "Generation Failed";
          errorDescription = error.message;
          }
          }
  
          toast.error(errorMessage, {
          description: errorDescription,
          });
          } finally {
          setLoading(false);
          }
          };
  
          const onDelete = async () => {
          if (!initialData) return;
          try {
          setLoading(true);
          await deleteDoc(doc(db, "interviews", initialData.id));
          toast.success("Interview Deleted", { description: "The mock interview has been removed."});
          navigate("/generate", { replace: true });
          } catch (error) {
          console.error("Error deleting document: ", error);
          toast.error("Deletion Failed", { description: "Could not delete the interview. Please try again."});
          } finally {
          setLoading(false);
          }
          }
  
          useEffect(() => {
          if (initialData) form.reset(initialData);
          }, [initialData, form]);
  
          return (
          <div className="w-full flex-col space-y-4 pt-4">
            <CustomBreadCrumb breadCrumbPage={breadCrumpPage} breadCrumpItems={[{ label: "Dashboard" , link: "/generate" }]} />
            <Separator className="!my-6" />
  
            {/* UI/UX Improvement: Using Card for better structure */}
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                      </div>
                      {/* UI/UX Improvement: Safer delete with confirmation */}
                      {initialData && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="destructive" disabled={loading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this mock interview.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* UI/UX Improvement: Two-column grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="position" render={({ field })=> (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Job Role / Position</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="e.g., Senior Frontend Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="description" render={({ field })=> (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea rows={5} disabled={loading} placeholder="Paste or describe the key responsibilities and requirements..." {...field} />
                            </FormControl>
                            <FormDescription>
                              A detailed description helps the AI generate more relevant questions.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                          )}
                          />
                          <FormField control={form.control} name="techStack" render={({ field })=> (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Primary Tech Stack</FormLabel>
                              <FormControl>
                                <Input disabled={loading} placeholder="e.g., React, Node.js, TypeScript, PostgreSQL" {...field} />
                              </FormControl>
                              <FormDescription>
                                List the main technologies, separated by commas.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                            )}
                            />
                            <FormField control={form.control} name="experience" render={({ field })=> (
                              <FormItem>
                                <FormLabel>Years of Experience</FormLabel>
                                <FormControl>
                                  <Input type="number" min={0} disabled={loading} placeholder="e.g., 5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                              )}
                              />
                              <FormField control={form.control} name="numberOfQuestions" render={({ field })=> (
                                <FormItem>
                                  <FormLabel>Number of Questions</FormLabel>
                                  <FormControl>
                                    <Input type="number" min={1} max={20} disabled={loading} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="interviewType" render={({ field })=> (
                                  // UI/UX Improvement: Replaced native select with shadcn/ui Select
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Interview Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an interview type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="behavioural">Behavioural</SelectItem>
                                        <SelectItem value="mixed">Mixed (Technical & Behavioural)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                  )}
                                  />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex items-center justify-end">
                      <Button type="submit" disabled={loading}>
                        {/* UI/UX Improvement: More descriptive loading state */}
                        {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating & Saving...
                        </>
                        ) : (
                        actionLabel
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </form>
            </FormProvider>
          </div>
          );
          };