import { Headings } from "@/components/headings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Plus, FileClock, History } from "lucide-react"; // More thematic icons
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { InterviewListSection } from "@/components/interview-list-section"; // Import the new component

export const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        setInterviews(interviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching interviews: ", error);
        toast.error("Failed to load interviews.", {
          description: "Please check your connection and try again.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Use useMemo to prevent re-filtering on every render
  const pendingInterviews = useMemo(
    () => interviews.filter((i) => i.status === 'pending'),
    [interviews]
  );
  
  const attemptedInterviews = useMemo(
    () => interviews.filter((i) => i.status === 'attempted'),
    [interviews]
  );

  return (
    <>
      <div className="flex w-full items-center justify-between pt-4">
        <Headings
          title="My Dashboard"
          description="Create and manage your AI Mock Interviews."
        />
        <Link to={"/generate/create"}>
          <Button size={"sm"}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </Link>
      </div>

      <Separator className="my-8" />

      {/* Upcoming Interviews Section */}
      <InterviewListSection
        title="Upcoming Interviews"
        loading={loading}
        interviews={pendingInterviews}
        emptyState={{
          icon: <FileClock size={48} />,
          title: "No Pending Interviews",
          description: "You're all caught up! Create a new mock interview to get started.",
          showCta: true,
        }}
      />

      {/* Past Interviews Section */}
      <InterviewListSection
        title="Past Interviews"
        loading={loading}
        interviews={attemptedInterviews}
        emptyState={{
          icon: <History size={48} />,
          title: "No Attempted Interviews",
          description: "Your past interview results and feedback will appear here after you complete one.",
          showCta: false,
        }}
      />
    </>
  );
};