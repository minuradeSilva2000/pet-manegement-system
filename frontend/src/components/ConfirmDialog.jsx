import React, { useState, useCallback, createContext, useContext } from 'react';

// Context confirmation dialog
const ConfirmDialogContext = createContext(null);

// Main component
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-11/12 max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-rose-300 text-white px-5 py-4 font-bold text-lg">
          {title}
        </div>
        <div className="p-5 text-center text-gray-600 leading-relaxed">
          {message}
        </div>
        <div className="flex border-t border-gray-200">
          <button 
            className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition duration-200 hover:-translate-y-0.5"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="flex-1 py-4 font-bold text-white bg-rose-300 hover:bg-rose-400 transition duration-200 hover:-translate-y-0.5"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Provider component
export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const openConfirmDialog = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    onConfirm = () => {},
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  }) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setDialogState(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ openConfirmDialog }}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
      />
    </ConfirmDialogContext.Provider>
  );
};

// Custom hook
export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};