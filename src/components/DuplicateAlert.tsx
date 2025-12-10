import { PasswordEntry } from '@/types/password';
import { AlertTriangle, Copy } from 'lucide-react';
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
    <div className="glass-card border-warning/30 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Copy className="w-5 h-5 text-warning" />
        <h3 className="font-medium text-warning">
          Duplicate Passwords Detected
        </h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {duplicateGroups.size} group{duplicateGroups.size > 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Reusing passwords across multiple accounts is a security risk. If one account is compromised, 
        all accounts with the same password become vulnerable.
      </p>

      <Accordion type="single" collapsible className="w-full">
        {Array.from(duplicateGroups.entries()).map(([, entries], index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>{entries.length} accounts share the same password</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 py-2">
                {entries.map((entry) => (
                  <li 
                    key={entry.id} 
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.username}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(entry)}
                    >
                      Change Password
                    </Button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
