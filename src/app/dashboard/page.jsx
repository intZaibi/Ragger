'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Key, Plus, Trash2, Wrench } from "lucide-react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


// Mock data - replace with API call
const mockApiKeys = [
    { id: '1', key: 'idxr_live_xxxxxxxxxxxxxxxxxxxx1234', createdAt: 'Aug 19, 2025' },
    { id: '2', key: 'idxr_live_xxxxxxxxxxxxxxxxxxxx5678', createdAt: 'Aug 18, 2025' },
];

export default function Dashboard() {
    const [apiKeys, setApiKeys] = useState(mockApiKeys);
    const [newKeyName, setNewKeyName] = useState('');

    const handleCreateKey = () => {
        // In a real app, this would be an API call to your backend
        const newKey = {
            id: Math.random().toString(),
            key: `idxr_live_${Math.random().toString(36).substring(2)}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setApiKeys([newKey, ...apiKeys]);
        setNewKeyName('');
        toast.success("New API key created!");
    };

    const handleDeleteKey = (id) => {
        // In a real app, this would be an API call
        setApiKeys(apiKeys.filter(key => key.id !== id));
        toast.info("API key deleted.");
    };
    
    const getScriptTag = (apiKey) => {
        return `<script src="https://your-domain.com/script.js" data-api-key="${apiKey}" defer></script>`;
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    }

    return (
        <div className="min-h-dvh overflow-y-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
            <Toaster richColors position="bottom-right" />
            
            {/* Main content container */}
            <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                </div>
                
                <Card className="mb-8 border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-800/20">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100">Create New API Key</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">Generate a new key to index a website.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input 
                                placeholder="e.g., My Personal Blog" 
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <Button onClick={handleCreateKey} className="sm:w-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600">
                                <Plus className="w-4 h-4 mr-2" /> Create Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-800/20">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100">Your API Keys</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">Manage your keys and embed the script on your website.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-gray-900 dark:text-gray-100">Key</TableHead>
                                    <TableHead className="hidden sm:table-cell text-gray-900 dark:text-gray-100">Created</TableHead>
                                    <TableHead className="text-gray-900 dark:text-gray-100">Script</TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map((apiKey) => (
                                    <TableRow key={apiKey.id} className="border-gray-200 dark:border-gray-700">
                                        <TableCell className="font-mono">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-800 dark:text-gray-200">{apiKey.key.substring(0, 11)}...{apiKey.key.slice(-4)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-gray-600 dark:text-gray-400">{apiKey.createdAt}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => copyToClipboard(getScriptTag(apiKey.key))}
                                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <Copy className="w-3 h-3 mr-2" /> Copy Script
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDeleteKey(apiKey.id)}
                                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Under Construction Overlay */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/30 backdrop-blur-md flex flex-col items-center justify-center z-10 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold text-white mb-2">Under Construction</h2>
                        <p className="text-gray-300">This page is currently being developed. Please check back later!</p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
