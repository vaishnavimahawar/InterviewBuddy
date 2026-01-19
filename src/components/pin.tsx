import { Interview } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles, Trash2 } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
}

export const InterviewPin = ({
  interview,
  onMockPage = false,
}: InterviewPinProps) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "interviews", interview.id));
      toast.success("Interview deleted successfully");
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    }
  };

  // Determine card color for attempted interviews with a score
  let cardColor = "";
  if (interview.status === "attempted" && typeof interview.score === "number") {
    if (interview.score <= 5) {
      cardColor = "bg-red-100 border-red-300";
    } else if (interview.score > 5 && interview.score <= 7) {
      cardColor = "bg-yellow-100 border-yellow-300";
    } else if (interview.score > 7) {
      cardColor = "bg-green-100 border-green-300";
    }
  }

  return (
    <Card className={cn("p-4 rounded-md shadow-none hover:shadow-md shadow-gray-100 cursor-pointer transition-all space-y-4 border", cardColor)}>
      <CardTitle className="text-lg">{interview?.position}</CardTitle>
      <CardDescription>{interview?.description}</CardDescription>
      
      <div className="w-full flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {interview?.interviewType || 'technical'} • {interview?.numberOfQuestions || 5} questions
        </Badge>
      </div>
      
      <div className="w-full flex items-center gap-2 flex-wrap">
        {interview?.techStack.split(",").map((word, index) => (
          <Badge
            key={index}
            variant={"outline"}
            className="text-xs text-muted-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900"
          >
            {word}
          </Badge>
        ))}
      </div>

      <CardFooter
        className={cn(
          "w-full flex items-center p-0",
          onMockPage ? "justify-end" : "justify-between"
        )}
      >
        <p className="text-[12px] text-muted-foreground truncate whitespace-nowrap">
          {`${new Date(interview?.createdAt.toDate()).toLocaleDateString(
            "en-US",
            { dateStyle: "long" }
          )} - ${new Date(interview?.createdAt.toDate()).toLocaleTimeString(
            "en-US",
            { timeStyle: "short" }
          )}`}
        </p>

        {!onMockPage && (
          <div className="flex items-center justify-center">
            <TooltipButton
              content="View"
              buttonVariant={"ghost"}
              onClick={() => {
                navigate(`/generate/${interview?.id}`, { replace: true });
              }}
              disbaled={false}
              buttonClassName="hover:text-sky-500"
              icon={<Eye />}
              loading={false}
            />

            <TooltipButton
              content="Feedback"
              buttonVariant={"ghost"}
              onClick={() => {
                navigate(`/generate/feedback/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="hover:text-yellow-500"
              icon={<Newspaper />}
              loading={false}
            />

            <TooltipButton
              content="Start"
              buttonVariant={"ghost"}
              onClick={() => {
                // Request full-screen mode
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen();
                } else if ((document.documentElement as any).webkitRequestFullscreen) {
                  (document.documentElement as any).webkitRequestFullscreen();
                } else if ((document.documentElement as any).msRequestFullscreen) {
                  (document.documentElement as any).msRequestFullscreen();
                }
                navigate(`/generate/interview/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="hover:text-green-500"
              icon={<Sparkles />}
              loading={false}
            />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <TooltipButton
                  content="Delete"
                  buttonVariant={"ghost"}
                  onClick={() => {}} // Empty function since AlertDialog handles the click
                  disbaled={false}
                  buttonClassName="hover:text-red-500"
                  icon={<Trash2 />}
                  loading={false}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Interview</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this interview? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
