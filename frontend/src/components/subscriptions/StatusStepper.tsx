// OWNER: FE-2
// PURPOSE: Visual progress stepper for subscription status lifecycle

import React from 'react';
import { SubscriptionStatus } from '../../types';

export interface StatusStepperProps {
  currentStatus: SubscriptionStatus;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const steps: SubscriptionStatus[] = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];

  const statusLabels: Record<SubscriptionStatus, string> = {
    DRAFT: 'Draft',
    QUOTATION: 'Quotation',
    CONFIRMED: 'Confirmed',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
  };

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="w-full py-4 bg-white rounded-xl border border-slate-200 px-6 shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = step === currentStatus;
          const isClosed = currentStatus === 'CLOSED' && step === 'CLOSED';

          let circleStyle = 'bg-slate-100 text-slate-400 border-slate-300';
          let textStyle = 'text-slate-400';

          if (isCompleted) {
            circleStyle = 'bg-indigo-600 text-white border-indigo-600';
            textStyle = 'text-indigo-600 font-medium';
          } else if (isCurrent) {
            circleStyle = isClosed
              ? 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-100'
              : 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100';
            textStyle = isClosed ? 'text-rose-700 font-bold' : 'text-indigo-700 font-bold';
          }

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all ${circleStyle}`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`mt-2 text-xs tracking-tight ${textStyle}`}>
                  {statusLabels[step]}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    idx < currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
