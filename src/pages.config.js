import AIChat from './pages/AIChat';
import BibleAssistant from './pages/BibleAssistant';
import BibleSearch from './pages/BibleSearch';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Payments from './pages/Payments';
import SavedContent from './pages/SavedContent';
import SignIn from './pages/SignIn';
import AISettings from './pages/AISettings';
import Store from './pages/Store';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "BibleAssistant": BibleAssistant,
    "BibleSearch": BibleSearch,
    "Forum": Forum,
    "Home": Home,
    "Notes": Notes,
    "Payments": Payments,
    "SavedContent": SavedContent,
    "SignIn": SignIn,
    "AISettings": AISettings,
    "Store": Store,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};