'use client';

import { Disclosure, Dialog } from '@headlessui/react';
import { ArrowDownIcon, Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

const navigation = [
	{ name: 'Dashboard', href: '/', current: true },
	{ name: 'Editor', href: '/editor', current: false },
	{ name: 'Download', href: '/download', current: false },
	{ name: 'Settings', href: '/settings', current: false },
];

function classNames(...classes: any[]) {
	return classes.filter(Boolean).join(' ');
}

function setPage(href: string) {
	navigation.forEach((x) => (x.href === href ? (x.current = true) : (x.current = false)));
}

export default function Example() {
	const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
	setPage(usePathname());

	return (
		<Disclosure as="nav" className="bg-gray-800">
			{({ open }) => (
				<>
					<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
						<div className="relative flex h-16 items-center justify-between">
							<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
								{/* Mobile menu button*/}
								<Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
									<span className="sr-only">Open main menu</span>
									{open ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</Disclosure.Button>
							</div>
							<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
								<div className="flex flex-shrink-0 items-center">
									<Image
										className="block h-8 w-auto lg:hidden"
										src="/icon.png"
										alt="Your Company"
										width={512}
										height={512}
									/>
								</div>
								<div className="hidden sm:ml-6 sm:block">
									<div className="flex space-x-4">
										{navigation.map((item) => (
											<a
												key={item.name}
												href={item.href}
												className={classNames(
													item.current
														? 'bg-gray-900 text-white'
														: 'text-gray-300 hover:bg-gray-700 hover:text-white',
													'rounded-md px-3 py-2 text-sm font-medium'
												)}
												aria-current={item.current ? 'page' : undefined}
												onClick={() => {
													navigation.forEach((x) =>
														x.name === item.name
															? (x.current = true)
															: (x.current = false)
													);
												}}
											>
												{item.name}
											</a>
										))}
									</div>
								</div>
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								<button
									type="button"
									className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
									onClick={() => {
										setNotificationOpen(!notificationOpen);
									}}
								>
									<span className="sr-only">View notifications</span>

									<Dialog
										className="absolute py-4 px-8 top-24 right-4 bg-gray-600 rounded-lg animate-jump"
										open={notificationOpen}
										onClose={() => setNotificationOpen(false)}
									>
										<Dialog.Panel className="flex gap-2">
											<ArrowDownIcon className="h-6 w-6" aria-hidden="true" />
											<h1>Update available!</h1>
										</Dialog.Panel>
									</Dialog>
									<span className="relative flex h-6 w-6">
										<span className="hover:motion-safe:animate-ping absolute hover:opacity-75 right-0 inline-flex h-full w-full rounded-full opacity-0 bg-sky-600"></span>
										<BellIcon className="h-6 w-6" aria-hidden="true" />
									</span>
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</Disclosure>
	);
}
