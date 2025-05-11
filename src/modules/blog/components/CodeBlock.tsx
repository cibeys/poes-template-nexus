
import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(language || "javascript");

  // Example multi-language code blocks
  const codeExamples = {
    html: `<div class="container">
  <h1>Hello World</h1>
  <p>This is a simple HTML example</p>
</div>`,
    css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  font-size: 2rem;
}`,
    javascript: code || `function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));`,
  };

  const copyToClipboard = () => {
    const textToCopy = activeTab === language ? code : codeExamples[activeTab as keyof typeof codeExamples];
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <motion.div 
      className="code-block group my-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs defaultValue={language || "javascript"} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/80">
          <TabsList className="h-9 bg-transparent">
            <TabsTrigger 
              value="html" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium",
                activeTab === "html" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              HTML
            </TabsTrigger>
            <TabsTrigger 
              value="css" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium",
                activeTab === "css" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              CSS
            </TabsTrigger>
            <TabsTrigger 
              value="javascript" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium", 
                activeTab === "javascript" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              JavaScript
            </TabsTrigger>
          </TabsList>
          
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label="Copy code"
            title="Copy code"
          >
            {isCopied ? (
              <>
                <Check size={14} className="mr-1.5" /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1.5" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="code-content overflow-x-auto p-4">
          <TabsContent value="html" className="mt-0">
            <pre className="language-html"><code>{codeExamples.html}</code></pre>
          </TabsContent>
          <TabsContent value="css" className="mt-0">
            <pre className="language-css"><code>{codeExamples.css}</code></pre>
          </TabsContent>
          <TabsContent value="javascript" className="mt-0">
            <pre className="language-javascript"><code>{activeTab === language ? code : codeExamples.javascript}</code></pre>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
