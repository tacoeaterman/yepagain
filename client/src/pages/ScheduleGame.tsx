import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ScheduleGame() {
  const { user } = useAuth();
  const { hasHostingPrivilege } = useGame();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [gameName, setGameName] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [playerEmails, setPlayerEmails] = useState("");
  const [playerPhones, setPlayerPhones] = useState("");
  const [notes, setNotes] = useState("");
  const [notificationType, setNotificationType] = useState("email"); // "email" or "sms"

  // Time options for the select
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return format(new Date().setHours(hour, minute), "hh:mm a");
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasHostingPrivilege) {
      toast({
        title: "Hosting Privilege Required",
        description: "You need hosting privileges to schedule games",
        variant: "destructive",
      });
      return;
    }

    if (!gameName || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement game scheduling logic
      const emails = playerEmails.split(",").map(email => email.trim()).filter(Boolean);
      const phones = playerPhones.split(",").map(phone => phone.trim()).filter(Boolean);

      // For now, just show success message
      toast({
        title: "Game Scheduled!",
        description: "Invitations will be sent to players",
      });

      // Return to main menu
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule game. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!hasHostingPrivilege) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">Hosting Privilege Required</h1>
            <p className="text-white/70 mb-6">You need hosting privileges to schedule games.</p>
            <Button
              onClick={() => setLocation("/store")}
              className="bg-brand-accent text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-accent/90 transition-colors"
            >
              Purchase Hosting Privilege
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="glass-card rounded-3xl p-8 border-0">
        <CardContent className="p-0">
          <h1 className="text-2xl font-bold text-white mb-6">Schedule a Game</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Name */}
            <div>
              <Label className="text-white/80">Game Name</Label>
              <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Enter a name for your game"
              />
            </div>

            {/* Date Picker */}
            <div>
              <Label className="text-white/80">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full mt-2 bg-white/10 border-white/20 text-white justify-start text-left font-normal",
                      !date && "text-white/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div>
              <Label className="text-white/80">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full mt-2 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Type */}
            <div>
              <Label className="text-white/80">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger className="w-full mt-2 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Player Emails */}
            {(notificationType === "email" || notificationType === "both") && (
              <div>
                <Label className="text-white/80">Player Emails</Label>
                <Textarea
                  value={playerEmails}
                  onChange={(e) => setPlayerEmails(e.target.value)}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Enter player emails (comma-separated)"
                />
                <p className="text-white/50 text-sm mt-1">Example: player1@email.com, player2@email.com</p>
              </div>
            )}

            {/* Player Phone Numbers */}
            {(notificationType === "sms" || notificationType === "both") && (
              <div>
                <Label className="text-white/80">Player Phone Numbers</Label>
                <Textarea
                  value={playerPhones}
                  onChange={(e) => setPlayerPhones(e.target.value)}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Enter phone numbers (comma-separated)"
                />
                <p className="text-white/50 text-sm mt-1">Example: +1234567890, +0987654321</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-white/80">Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Add any additional notes for players"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-brand-accent text-white font-semibold py-4 rounded-xl hover:bg-brand-accent/90 transition-colors"
              >
                Schedule Game
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/")}
                className="bg-white/10 text-white font-semibold py-4 rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
