"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  DatabaseZap,
  FileText,
  BotMessageSquare,
  ShieldCheck,
  Upload,
  Link as LinkIcon,
  Search,
  MessageSquare,
  Zap,
  ChevronDown,
  Sparkles,
  Brain,
  Code,
  Globe,
  FileBox,
  NotebookPen
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// Feature data array for easy mapping
const features = [
  {
    icon: <DatabaseZap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Multiple Data Sources",
    description: "Easily build your chatbot's knowledge base by pasting text, uploading files (.pdf, .csv, .txt), or indexing content directly from a website URL.",
    details: [
      { icon: <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Paste any text content" },
      { icon: <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Upload PDF, CSV, TXT files" },
      { icon: <LinkIcon className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Index website content via URLs" }
    ]
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Fast & Private Client-Side Processing",
    description: "All file reading and text chunking happens directly in your browser. This ensures your data remains private and the processing is lightning-fast.",
    details: [
      { icon: <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "No data sent to external servers" },
      { icon: <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Enhanced privacy and security" },
      { icon: <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Faster processing without network delays" }
    ]
  },
  {
    icon: <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Intelligent Chunking & Source Tracking",
    description: "Large documents are automatically broken down into smaller, optimized chunks. You can easily track all your sources and see how they're organized.",
    details: [
      { icon: <FileBox className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Automatic text segmentation" },
      { icon: <NotebookPen className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Source organization by original content" },
      { icon: <Search className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Visual chunk tracking for each source" }
    ]
  },
  {
    icon: <BotMessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Interactive Chat with RAG Simulation",
    description: "Ask questions in a notebook-style chat. The app simulates a RAG pipeline by retrieving the most relevant chunks and showing the sources used for the answer.",
    details: [
      { icon: <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Keyword-based retrieval system" },
      { icon: <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Source attribution display" },
      { icon: <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />, text: "Response generation simulation" }
    ]
  },
];

const steps = [
  {
    number: "01",
    title: "Add Your Data",
    description: "Upload files, paste text, or provide a URL. Your content is processed securely in your browser.",
    icon: <Upload className="w-6 h-6" />
  },
  {
    number: "02",
    title: "Process & Organize",
    description: "Our system automatically chunks and indexes your content for optimal retrieval.",
    icon: <Code className="w-6 h-6" />
  },
  {
    number: "03",
    title: "Chat & Explore",
    description: "Ask questions and get answers based on your content with source references.",
    icon: <MessageSquare className="w-6 h-6" />
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32 lg:py-40">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2" /> No coding required
              </motion.div>
              
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Create a Custom Chatbot for Your Website in Minutes
              </h1>
              
              <motion.p
                className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Our platform allows you to index any website and instantly create an intelligent chatbot that can answer questions about its content.
              </motion.p>
              
              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-gray-800 dark:border-gray-300 text-gray-800 dark:text-gray-300">
                  <Link href="#features">Learn More</Link>
                </Button>
              </motion.div>
              
              <motion.div
                className="mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">chatbot-demo</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <BotMessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium">How can I return a product?</p>
                          <p className="text-sm text-gray-500 text-start dark:text-gray-400 mt-1">Based on Return Policy</p>
                        </div>
                      </div>
                      <div className="ml-11 p-4 text-justify bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                        You can return products within 30 days of purchase. Please visit our returns page for more information.
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Sources Used</h3>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">3 chunks</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>return-policy.pdf</span>
                        </li>
                        <li className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>website.com/help</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="flex justify-center mt-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <ChevronDown className="w-8 h-8 text-gray-400 animate-bounce" />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-black dark:text-white">How It Works</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              A simple, three-step process to bring your intelligent chatbot to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 h-full">
                  <div className="text-5xl font-bold text-gray-200 dark:text-gray-700 mb-2">{step.number}</div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-black dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-black dark:text-white">Powerful Features, Simple Interface</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to build a knowledgeable and reliable AI assistant from your own content.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2">{detail.icon}</span>
                      <span className="text-gray-700 dark:text-gray-300">{detail.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-black dark:text-white">Multiple Ways to Add Content</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Flexible options to build your chatbot's knowledge base.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Paste Text</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Directly paste any text content into your knowledge base.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Upload Files</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Upload PDF, CSV, and TXT files. Processed directly in your browser.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Website URLs</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Input a URL to fetch and index a website's content.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Create Your Chatbot?
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto mb-8 text-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Start building your intelligent chatbot in minutes with no coding required.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-200">
              <Link href="/dashboard">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}