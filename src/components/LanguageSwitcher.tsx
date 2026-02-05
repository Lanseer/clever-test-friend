 import { Globe } from "lucide-react";
 import { useTranslation } from "react-i18next";
 import { Button } from "@/components/ui/button";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { cn } from "@/lib/utils";
 
 interface LanguageSwitcherProps {
   variant?: "default" | "login";
   className?: string;
 }
 
 export function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
   const { i18n, t } = useTranslation();
 
   const changeLanguage = (lng: string) => {
     i18n.changeLanguage(lng);
     localStorage.setItem('language', lng);
   };
 
   const currentLang = i18n.language === 'en' ? 'EN' : '中';
 
   if (variant === "login") {
     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button
             variant="ghost"
             size="sm"
             className={cn(
               "text-white/70 hover:text-white hover:bg-white/10 gap-1.5",
               className
             )}
           >
             <Globe className="w-4 h-4" />
             <span className="text-sm">{currentLang}</span>
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="min-w-[100px]">
           <DropdownMenuItem 
             onClick={() => changeLanguage('zh')}
             className={cn(i18n.language === 'zh' && "bg-accent")}
           >
             {t('language.zh')}
           </DropdownMenuItem>
           <DropdownMenuItem 
             onClick={() => changeLanguage('en')}
             className={cn(i18n.language === 'en' && "bg-accent")}
           >
             {t('language.en')}
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     );
   }
 
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button
           variant="ghost"
           size="sm"
           className={cn(
             "w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-9 gap-2",
             className
           )}
         >
           <Globe className="w-4 h-4" />
           <span className="text-sm">{currentLang}</span>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="min-w-[100px]">
         <DropdownMenuItem 
           onClick={() => changeLanguage('zh')}
           className={cn(i18n.language === 'zh' && "bg-accent")}
         >
           {t('language.zh')}
         </DropdownMenuItem>
         <DropdownMenuItem 
           onClick={() => changeLanguage('en')}
           className={cn(i18n.language === 'en' && "bg-accent")}
         >
           {t('language.en')}
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 }