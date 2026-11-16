import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import contactService from '../../services/contactService';
import type { Contact } from '../../types/contact';

interface DeleteContactModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onDeleted: (contactId: number) => void;
}

export const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  isOpen,
  contact,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !contact) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await contactService.deleteContact(contact.id);
      onDeleted(contact.id);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(apiErr.response?.data?.message || 'Failed to delete contact person.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Delete Contact
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                Remove stakeholder from directory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to remove stakeholder{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {contact.first_name} {contact.last_name}
            </strong>{' '}
            from <strong className="text-slate-800 dark:text-slate-200">{contact.account?.organization_name || 'Account'}</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactModal;
