"use client";

import { Bell, Search, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-30 bg-black/40 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Ask AI CEO (e.g. 'Show unpaid invoices')..." 
            className="w-full bg-black/20 border border-white/10 rounded-full py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors">
            <Mic className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-5 h-5 text-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
        </button>

        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">Jonas Admin</p>
            <p className="text-xs text-primary">Chief AI Officer</p>
          </div>
          <Avatar className="border border-primary/50 ring-2 ring-primary/20 cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </motion.header>
  );
}
