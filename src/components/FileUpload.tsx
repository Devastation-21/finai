"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { FileUploadStatus } from "@/types";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadStatus: FileUploadStatus;
  onUploadSuccess?: () => void;
}

const acceptedFileTypes = {
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/pdf": [".pdf"],
};

const fileTypeIcons = {
  "text/csv": FileText,
  "application/vnd.ms-excel": FileSpreadsheet,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "application/pdf": File,
};

export function FileUpload({ onFileUpload, uploadStatus, onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onFileUpload(acceptedFiles[0]);
      // Call refresh callback after upload if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  }, [onFileUpload, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case "uploading":
      case "processing":
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      default:
        return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus.status) {
      case "success":
        return "File processed successfully!";
      case "error":
        return uploadStatus.message || "Upload failed. Please try again.";
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing file with AI...";
      default:
        return "Drag & drop your financial file here";
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Upload Financial Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop your CSV, Excel, or PDF files here
          </p>
        </div>

          {/* File Type Badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              CSV
            </Badge>
            <Badge variant="outline" className="gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              Excel
            </Badge>
            <Badge variant="outline" className="gap-1">
              <File className="h-3 w-3" />
              PDF
            </Badge>
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive || dragActive
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
              ${uploadStatus.status === "uploading" || uploadStatus.status === "processing"
                ? "pointer-events-none opacity-75"
                : ""
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              {getStatusIcon()}
              
              <div>
                <p className="text-sm font-medium">
                  {getStatusMessage()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>

              {/* Progress Bar */}
              {uploadStatus.status === "uploading" && uploadStatus.progress !== undefined && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={uploadStatus.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {uploadStatus.progress}% uploaded
                  </p>
                </div>
              )}

              {/* Processing Animation */}
              {uploadStatus.status === "processing" && (
                <div className="space-y-2">
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI is analyzing your financial data...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          {uploadStatus.status === "idle" && (
            <div className="text-center">
              <Button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>
          )}

          {/* Success Actions */}
          {uploadStatus.status === "success" && (
            <div className="text-center space-y-2">
              <Button
                onClick={() => {
                  if (onUploadSuccess) {
                    onUploadSuccess();
                  } else {
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="gap-2"
              >
                Upload Another File
              </Button>
            </div>
          )}

          {/* Error Actions */}
          {uploadStatus.status === "error" && (
            <div className="text-center space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
  );
}

