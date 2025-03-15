import { User, File, TextResult } from '../../types';

export interface User {
  avatar: string;
  name: string;
  role: string;
  nameParts?: TextPart[];
  roleParts?: TextPart[];
}

export interface File {
  icon: string;
  name: string;
  type: string;
  date: string;
  nameParts?: TextPart[];
  typeParts?: TextPart[];
}

export const allUserResults: User[] = [
  {
    avatar: "public/user-2.jpg",
    name: "John Rodriguez",
    role: "Administrator",
  },
  {
    avatar: "public/user-1.jpg",
    name: "Sarah Johnson",
    role: "Shop owner",
  },
];

export const allFileResults: File[] = [
  {
    icon: "public/keynote.png",
    name: "John-Proposal.key",
    type: "PowerPoint Presentation",
    date: "25 May, 2023",
  },
  {
    icon: "public/pages.png",
    name: "Contract-John-2023.pages",
    type: "Pages Document",
    date: "12 May, 2023",
  },
];

export const allTextResults: TextResult[] = [
  {
    text: "John hurriedly packed his bags and embarked on ...",
  },
  {
    text: "After a long day at work, John relished a soothing ...",
  },
];