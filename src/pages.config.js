import AIChat from './pages/AIChat';
import AISettings from './pages/AISettings';
import BibleAssistant from './pages/BibleAssistant';
import BibleSearch from './pages/BibleSearch';
import ContactUs from './pages/ContactUs';
import Forum from './pages/Forum';
import Home from './pages/Home';
import HomeSpanish from './pages/HomeSpanish';
import Messages from './pages/Messages';
import Notes from './pages/Notes';
import Payments from './pages/Payments';
import SavedContent from './pages/SavedContent';
import Search from './pages/Search';
import SignIn from './pages/SignIn';
import Store from './pages/Store';
import TopicalStudies from './pages/TopicalStudies';
import UserProfile from './pages/UserProfile';
import Churches from './pages/Churches';
import Sermons from './pages/Sermons';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "AISettings": AISettings,
    "BibleAssistant": BibleAssistant,
    "BibleSearch": BibleSearch,
    "ContactUs": ContactUs,
    "Forum": Forum,
    "Home": Home,
    "HomeSpanish": HomeSpanish,
    "Messages": Messages,
    "Notes": Notes,
    "Payments": Payments,
    "SavedContent": SavedContent,
    "Search": Search,
    "SignIn": SignIn,
    "Store": Store,
    "TopicalStudies": TopicalStudies,
    "UserProfile": UserProfile,
    "Churches": Churches,
    "Sermons": Sermons,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};