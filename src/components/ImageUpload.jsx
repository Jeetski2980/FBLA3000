import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ImageUpload({ value, onChange, onRemove, label, className = "" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WEBP, or GIF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size is 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      {label && <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">{label}</label>}
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-video rounded-2xl overflow-hidden border border-white/20 group"
          >
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={onRemove}
                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <div className={`p-4 rounded-2xl ${isDragging ? 'bg-primary/10 text-white' : 'bg-white/10 text-white'}`}>
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">Drag & drop image</p>
              <p className="text-xs text-white mt-1">or click to browse</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-xs text-white mt-2 font-medium">{error}</p>}
    </div>
  );
}
