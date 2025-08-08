import { Icon } from "@iconify/react";
import { NavLink } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Sidebar() {
  type Link = {
    name: string;
    href?: string;
    icon: string;
    subroot: string;
    child?: {
      name: string;
      href: string;
    }[];
  };

  const links: Link[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "material-symbols:dashboard-rounded",
      subroot: "/dashboard",
    },
    {
      name: "Bible",
      icon: "mdi:bible",
      subroot: "/layout/bible",
      child: [
        {
          name: "Bible ",
          href: "/layout/bible",
        },
        {
          name: "Bible Audio",
          href: "/layout/_bible-audio",
        },
        {
          name: "Edit Bible",
          href: "/layout/_bible-edit",
        },
      ],
    },
    {
      name: "Messages",
      icon: "mdi:book-outline",
      subroot: "/layout/messages",
      child: [
        {
          name: "Message",
          href: "/layout/messages",
        },
        {
          name: "Message Audio",
          href: "/layout/message-audio",
        },
      ],
    },
    {
      name: "Song Books",
      icon: "mdi:book-open-page-variant",
      subroot: "/layout/songbooks",
      child: [
        {
          name: "Song Books",
          href: "/layout/songbooks",
        },
        {
          name: "Song Book Audios",
          href: "/layout/songbook-audio",
        },
      ],
    },
    {
      name: "COD",
      href: "/layout/cod",
      icon: "ri:question-line",
      subroot: "/layout/cod",
    },
    {
      name: "Churches",
      href: "/layout/churches",
      icon: "material-symbols:church",
      subroot: "/layout/churches",
    },
    {
      name: "Gallery",
      href: "/layout/gallery",
      icon: "mdi:image-multiple-outline",
      subroot: "/layout/gallery",
    },
    {
      name: "இன்றைய மன்னா ",
      href: "/layout/dailymanna",
      icon: "dashicons:playlist-audio",
      subroot: "/layout/dailymanna",
    },
    {
      name: "New Books",
      href: "/layout/newbooks",
      icon: "mdi:book-open-page-variant",
      subroot: "/layout/newbooks",
    },
    {
      name: "Published Books",
      icon: "mdi:book-open-page-variant",
      subroot: "/layout/publishedbooks",
      child: [
        {
          name: "Published  Books",
          href: "/layout/publishedbooks",
        },
        {
          name: " Published  Books Audio",
          href: "/layout/editpublishedbooks",
        },
      ],
    },
    {
      name: "Tamil Special Books",
      icon: "mdi:book-open-page-variant",
      subroot: "/layout/tamilspecialbooks",
      child: [
        {
          name: "Tamil Special  Books",
          href: "/layout/tamilspecialbooks",
        },
        {
          name: "Edit Tamil Special  Books",
          href: "/layout/edittamilspecialbooks",
        },
      ],
    },
    {
      name: "English Special Books",
      icon: "mdi:book-open-page-variant",
      subroot: "/layout/englishspecialbooks",
      child: [
        {
          name: "English Special  Books",
          href: "/layout/englishspecialbooks",
        },
        {
          name: "Edit English Special  Books",
          href: "/layout/editenglishspecialbooks",
        },
      ],
    },
    {
      name: "Message Sermon",
      icon: "fa6-solid:table-list",
      subroot: "/layout/messagesermon",
      child: [
        {
          name: "Tamil Message Sermon",
          href: "/layout/tamilmessagesermon",
        },
        {
          name: "Create English  Sermon",
          href: "/layout/create-english-sermon",
        },
        {
          name: "Upload English  Sermon",
          href: "/layout/upload-english-sermon",
        },
      ],
    },
  ];

  return (
    <nav className='grid items-start gap-2 px-2 text-sm font-medium lg:px-4'>
      {links.map((link) =>
        link.child ? (
          <Collapsible key={link.name}>
            <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900'>
              <div className='flex items-center gap-2'>
                <Icon icon={link.icon} className='h-4 w-4' />
                {link.name}
              </div>
              <Icon icon='mdi:chevron-down' className='h-4 w-4' />
            </CollapsibleTrigger>
            <CollapsibleContent className='ml-4 mt-1'>
              {link.child.map((child) => (
                <NavLink
                  key={child.name}
                  to={child.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 mb-1 ml-6  rounded-md p-2 ${
                      isActive
                        ? "bg-slate-400 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }>
                  {child.name}
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <NavLink
            key={link.name}
            to={link?.href || link.subroot}
            className={({ isActive }) =>
              `group flex items-center gap-2 rounded-md p-2 ${
                isActive
                  ? "bg-slate-400 text-slate-900"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`
            }>
            <Icon icon={link.icon} className='h-4 w-4' />
            {link.name}
          </NavLink>
        )
      )}
    </nav>
  );
}
