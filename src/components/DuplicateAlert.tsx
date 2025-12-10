import { PasswordEntry } from '@/types/password';
import { AlertTriangle, Copy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DuplicateAlertProps {
  duplicateGroups: Map<string, PasswordEntry[]>;
  onEdit: (entry: PasswordEntry) => void;
}

export function DuplicateAlert({ duplicateGroups, onEdit }: DuplicateAlertProps) {
  if (duplicateGroups.size === 0) return null;

  return (
    <div className="glass-card border-warning/30 p-5 animate-fade-in bg-warning/5">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-warning/10">
          <Copy className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">
              Duplicate Passwords Detected
            </h3>
            <span className="text-sm font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              {duplicateGroups.size} group{duplicateGroups.size > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Reusing passwords puts multiple accounts at risk. If one is compromised, all become vulnerable.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {Array.from(duplicateGroups.entries()).map(([, entries], index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-sm hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="font-medium">{entries.length} accounts share the same password</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 py-2">
                    {entries.map((entry) => (
                      <li 
                        key={entry.id} 
                        className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                      >
                        <div>
                          <p className="font-medium text-sm text-foreground">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.username}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(entry)}
                          className="text-primary"
                        >
                          Change
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
