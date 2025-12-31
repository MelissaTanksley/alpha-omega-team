import AIChat from './pages/AIChat';
import AISettings from './pages/AISettings';
import BibleAssistant from './pages/BibleAssistant';
import BibleSearch from './pages/BibleSearch';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Payments from './pages/Payments';
import SavedContent from './pages/SavedContent';
import SignIn from './pages/SignIn';
import Store from './pages/Store';
import HomeSpanish from './pages/HomeSpanish';
import ContactUs from './pages/ContactUs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "AISettings": AISettings,
    "BibleAssistant": BibleAssistant,
    "BibleSearch": BibleSearch,
    "Forum": Forum,
    "Home": Home,
    "Notes": Notes,
    "Payments": Payments,
    "SavedContent": SavedContent,
    "SignIn": SignIn,
    "Store": Store,
    "HomeSpanish": HomeSpanish,
    "ContactUs": ContactUs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};