import React from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

const FixedEditOperatorDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Edit Operator
          </h2>
          <DialogClose className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FixedEditOperatorDialog; 