import AIChat from './pages/AIChat';
import BibleSearch from './pages/BibleSearch';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Payments from './pages/Payments';
import SignIn from './pages/SignIn';
import TeamProjects from './pages/TeamProjects';
import Forum from './pages/Forum';
import SavedContent from './pages/SavedContent';
import BibleAssistant from './pages/BibleAssistant';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "BibleSearch": BibleSearch,
    "Home": Home,
    "Notes": Notes,
    "Payments": Payments,
    "SignIn": SignIn,
    "TeamProjects": TeamProjects,
    "Forum": Forum,
    "SavedContent": SavedContent,
    "BibleAssistant": BibleAssistant,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};