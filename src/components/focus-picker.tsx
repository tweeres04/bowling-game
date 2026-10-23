"use client";

import { useState } from "react";
import { TargetIcon } from "@phosphor-icons/react";
import { setFocus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FOCUS_BOOST_LEVELS,
  FOCUS_LABELS,
  FOCUS_SHARE,
  FOCUSES,
  XP_PER_GAME,
  type Focus,
} from "@/lib/progression";

export function FocusPicker({ focus }: { focus: Focus }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" />}>
        <TargetIcon data-icon="inline-start" weight="bold" />
        {FOCUS_LABELS[focus]}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What are you focused on?</DialogTitle>
          <DialogDescription>
            You earn {XP_PER_GAME} XP every game. Pick a focus and it gets{" "}
            {XP_PER_GAME * FOCUS_SHARE} of that, plus {FOCUS_BOOST_LEVELS} bonus
            levels while you bowl. Balanced splits your XP evenly, with no
            bonus.
          </DialogDescription>
        </DialogHeader>
        <form
          action={setFocus}
          onSubmit={() => setOpen(false)}
          className="grid gap-2"
        >
          {FOCUSES.map((option) => (
            <Button
              key={option}
              type="submit"
              name="focus"
              value={option}
              variant={option === focus ? "default" : "secondary"}
              aria-pressed={option === focus}
            >
              {FOCUS_LABELS[option]}
            </Button>
          ))}
        </form>
      </DialogContent>
    </Dialog>
  );
}
