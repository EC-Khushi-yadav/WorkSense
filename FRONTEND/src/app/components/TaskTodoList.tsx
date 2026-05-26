/**
 * TaskTodoList - Clean checklist with animated checkboxes and localStorage persistence
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, X } from "lucide-react";
import { cn } from "../utils";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export const TaskTodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const stored = localStorage.getItem("worksense-todos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("worksense-todos", JSON.stringify(todos));
  }, [todos]);

  // Auto-focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((prev) => [
      ...prev,
      {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: input.trim(),
        completed: false,
        createdAt: Date.now(),
      },
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    // Mark for removal animation, then remove after delay
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  };

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(124,58,237,0.18)" }}
      className="rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-lg dark:border-slate-800/50 dark:bg-[#111827]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-[#7C3AED]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Todo List
          </h3>
          {todos.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
              {completedCount}/{todos.length}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "p-2 rounded-xl transition-all duration-300",
            isAdding
              ? "bg-red-500/10 text-red-500 border border-red-500/20"
              : "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20"
          )}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Add Todo Input */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a task..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                  if (e.key === "Escape") setIsAdding(false);
                }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  "bg-white/70 dark:bg-slate-800/50 backdrop-blur-md",
                  "border-2 border-slate-200/60 dark:border-slate-700/50",
                  "text-slate-900 dark:text-white placeholder:text-slate-400",
                  "focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10"
                )}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTodo}
                disabled={!input.trim()}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  "bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] text-white",
                  "shadow-[0_0_15px_rgba(124,58,237,0.3)]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence>
          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                No tasks yet. Click + to add one!
              </p>
            </motion.div>
          ) : (
            todos.map((todo, index) => {
              const isRemoving = removingIds.has(todo.id);
              return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={
                  isRemoving
                    ? { opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }
                    : { opacity: 1, y: 0, height: "auto" }
                }
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{
                  layout: { type: "spring", stiffness: 350, damping: 30 },
                  opacity: { duration: 0.25 },
                  height: { duration: 0.3 },
                  y: { type: "spring", stiffness: 300, damping: 24 },
                }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer",
                    "hover:bg-white/60 dark:hover:bg-slate-800/40",
                  )}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {/* Animated Checkbox */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="relative flex-shrink-0"
                  >
                    <AnimatePresence mode="wait">
                      {todo.completed ? (
                        <motion.div
                          key="checked"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unchecked"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-[#7C3AED] transition-colors" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Text with animated strike-through */}
                  <div className="flex-1 relative overflow-hidden">
                    <motion.span
                      animate={{
                        opacity: todo.completed ? 0.45 : 1,
                        color: todo.completed ? "#94a3b8" : undefined,
                      }}
                      transition={{ duration: 0.35 }}
                      className="text-sm font-medium select-none block text-slate-800 dark:text-slate-200"
                    >
                      {todo.text}
                    </motion.span>
                    {/* Expanding strike-through line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: todo.completed ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: todo.completed ? 0.05 : 0 }}
                      className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-slate-400 dark:bg-slate-500 origin-left pointer-events-none"
                      style={{ translateY: "-50%" }}
                    />
                  </div>

                  {/* Delete button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/30"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progress</span>
            <span className="text-xs font-bold text-[#7C3AED]">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200/50 dark:bg-slate-700/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] shadow-[0_0_8px_rgba(124,58,237,0.4)]"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
