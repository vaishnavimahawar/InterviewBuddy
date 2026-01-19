import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InterviewPin } from "@/components/pin";
import { Interview } from "@/types";

interface InterviewListSectionProps {
  title: string;
  loading: boolean;
  interviews: Interview[];
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
    showCta: boolean;
  };
}

export const InterviewListSection = ({
  title,
  loading,
  interviews,
  emptyState,
}: InterviewListSectionProps) => {

  const isEmpty = !loading && interviews.length === 0;

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-lg" />
      ));
    }

    if (interviews.length > 0) {
      return interviews.map((interview) => (
        <div key={interview.id} className="relative">
          <InterviewPin interview={interview} />
          {interview.status === 'attempted' && typeof interview.score === 'number' && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {interview.score}/10
            </div>
          )}
        </div>
      ));
    }

    // ========================================================
    // MODIFICATION HERE: Increased height of the empty state box
    // from 'h-48' to 'h-56' for more internal vertical space.
    // ========================================================
    return (
      <div className="md:col-span-3 lg:col-span-4 w-full flex flex-col items-center justify-center h-56 bg-muted/50 rounded-lg border-2 border-dashed border-border text-center p-4">
        <div className="text-muted-foreground mb-4">{emptyState.icon}</div>
        <h3 className="text-lg font-semibold text-foreground">{emptyState.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">{emptyState.description}</p>
        {emptyState.showCta && (
           <Link to={"/generate/create"}>
             <Button size="sm" variant="outline">
                Create New Interview
             </Button>
           </Link>
        )}
      </div>
    );
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      {/* ========================================================
        MODIFICATION HERE: Increased conditional vertical padding
        from 'py-10' to 'py-16' for more external vertical space.
        ========================================================
      */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${
          isEmpty ? 'py-16' : 'py-4'
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};