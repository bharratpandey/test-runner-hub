import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { LogTerminal } from "./LogTerminal";

export function MobileLogSheet() {
  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Terminal className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] p-0 bg-terminal">
          <LogTerminal className="h-full" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
