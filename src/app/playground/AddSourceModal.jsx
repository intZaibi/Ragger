"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, Globe, Upload, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

// Icon component for source types
const SourceIcon = ({ type }) => {
    const iconProps = { className: "w-5 h-5" };
    if (type === "Text") return <FileText {...iconProps} />;
    if (type === "URL") return <Globe {...iconProps} />;
    return <Upload {...iconProps} />;
};

const AddSourceModal = ({
    isOpen,
    onClose,
    setIsLoading,
    setLoadingMessage,
    setIsSourceModalOpen,
    onAddSource,
    onRemoveSource, // New prop to handle removal on error

    collectionName
}) => {
    const [textSource, setTextSource] = useState("");
    const [urlSource, setUrlSource] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }, []);

   const handleIndexSource = async (formData) => {
    // Make sure your component receives `collectionName` as a prop
    // For example: const AddSourceModal = ({ ..., collectionName }) => { ... }

    // Append the collectionName to the formData
    if (collectionName) {
        formData.append("collectionName", collectionName);
    } else {
        console.error("Collection name is missing!");
        alert("Cannot index source: No collection is selected.");
        return; // Stop the function if there's no collection name
    }

    const file = formData.get('file');
    const url = formData.get('url');
    const text = formData.get('text');
    const sourceTypeRaw = formData.get('sourceType') || '';

    const sourceName = file?.name || url || (text ? `${text.slice(0, 40)}...` : 'Pasted Text');
    const sourceType = sourceTypeRaw.charAt(0).toUpperCase() + sourceTypeRaw.slice(1);

    const tempSource = { name: sourceName, type: sourceType, loading: true };
    if (typeof onAddSource === 'function') {
        onAddSource(tempSource);
    }

    setIsSourceModalOpen(false);

    try {
        const response = await fetch('/api/index', {
            method: 'POST',
            body: formData, // formData now includes the collectionName
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to index source.');
        }

        const finalSource = { name: sourceName, type: sourceType, loading: false };
        if (typeof onAddSource === 'function') {
            onAddSource(finalSource);
        }

    } catch (error) {
        console.error('❌ Error indexing source:', error);
        alert(error.message || 'Something went wrong while indexing source.');
        if (typeof onRemoveSource === 'function') {
            onRemoveSource(sourceName);
        }
    }
};

    const handleAddText = () => {
        if (!textSource.trim()) return;
        const formData = new FormData();
        formData.append("sourceType", "text");
        formData.append("text", textSource);
        handleIndexSource(formData);
        setTextSource("");
    };

    const handleAddUrl = () => {
        if (!urlSource.trim()) return;
        const formData = new FormData();
        formData.append("sourceType", "url");
        formData.append("url", urlSource);
        handleIndexSource(formData);
        setUrlSource("");
    };

    const handleAddFile = () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append("sourceType", "file");
        formData.append("file", selectedFile);
        handleIndexSource(formData);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-900/80 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-200 dark:border-gray-700"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl font-bold mb-6 text-gray-900 dark:text-white"
                        >
                            Add a new source
                        </motion.h2>

                        <div className="space-y-6">
                            {/* Text Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <SourceIcon type="Text" /> Paste Text
                                </h3>
                                <Textarea
                                    value={textSource}
                                    onChange={(e) => setTextSource(e.target.value)}
                                    className="h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                    placeholder="Paste content here..."
                                />
                                <Button
                                    onClick={handleAddText}
                                    disabled={!textSource.trim()}
                                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Text Source
                                </Button>
                            </motion.div>

                            {/* URL Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <SourceIcon type="URL" /> From Website
                                </h3>
                                <Input
                                    type="url"
                                    value={urlSource}
                                    onChange={(e) => setUrlSource(e.target.value)}
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                    placeholder="https://example.com"
                                />
                                <Button
                                    onClick={handleAddUrl}
                                    disabled={!urlSource.trim()}
                                    className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Fetch from URL
                                </Button>
                            </motion.div>

                            {/* File Upload */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <SourceIcon type="File" /> Upload Document
                                </h3>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.csv,.txt"
                                    />
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    >
                                        Choose a file
                                    </Button>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedFile ? selectedFile.name : "PDF, CSV, or TXT"}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAddFile}
                                    disabled={!selectedFile}
                                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Upload File
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddSourceModal;
