import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    teamName: string;
    members: {
        User: {
            id: number;
            name: string;
            email: string;
            phoneNumber: string;
        };
    }[];
}

export default function TeamMembersModal({ isOpen, onClose, teamName, members }: Props) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/75" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                                    Team Members - {teamName}
                                </Dialog.Title>
                                <div className="mt-4 space-y-3">
                                    {members.length > 0 ? members.map((tm: any) => (
                                        <div key={tm.User.id} className="flex items-center justify-between rounded bg-slate-800 p-3">
                                            <div>
                                                <div className="font-semibold text-slate-200">{tm.User.name}</div>
                                                <div className="text-xs text-slate-400">{tm.User.email}</div>
                                            </div>
                                            <div className="text-right text-xs text-slate-500">{tm.User.phoneNumber}</div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-500 text-center py-4">No members found</p>
                                    )}
                                </div>

                                <div className="mt-6 text-right">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
