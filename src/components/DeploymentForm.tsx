import React from 'react';
import { DeploymentFormModal } from './DeploymentFormModal';
import { DeploymentRecord, DeploymentFormData } from '../types/deployment';

export interface DeploymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeploymentFormData, existingId?: string) => void;
  initialData?: DeploymentRecord | null;
  existingProducts: string[];
  lastGddNumber?: string;
}

export const DeploymentForm: React.FC<DeploymentFormProps> = (props) => {
  return <DeploymentFormModal {...props} />;
};
