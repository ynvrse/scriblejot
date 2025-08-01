import { Mail, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { email } from "@/config";
import resetApp from "@/utils/reset-app";

function AppErrorBoundaryFallback() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <h3 className="text-xl font-semibold">
          Sorry, I guess, something went wrong. You can:
        </h3>
        <Button asChild variant="outline" className="my-3">
          <a href={`mailto: ${email}`} target="_blank" rel="noreferrer">
            <Mail className="mr-2 h-4 w-4" />
            Contact author by email - {email}
          </a>
        </Button>
        <p className="text-center">or</p>
        <Button variant="outline" onClick={resetApp} className="mt-3 w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Press here to reset the application
        </Button>
      </div>
    </div>
  );
}

export default AppErrorBoundaryFallback;