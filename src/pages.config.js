/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import RiskAssessment from './pages/RiskAssessment';
import RiskDashboard from './pages/RiskDashboard';
import AIChat from './pages/AIChat';
import AISettings from './pages/AISettings';
import BibleAssistant from './pages/BibleAssistant';
import BibleSearch from './pages/BibleSearch';
import Churches from './pages/Churches';
import ContactUs from './pages/ContactUs';
import Forum from './pages/Forum';
import Home from './pages/Home';
import HomeSpanish from './pages/HomeSpanish';
import KidsBibleStudy from './pages/KidsBibleStudy';
import ManageContacts from './pages/ManageContacts';
import Messages from './pages/Messages';
import Notes from './pages/Notes';
import Payments from './pages/Payments';
import SavedContent from './pages/SavedContent';
import Search from './pages/Search';
import Sermons from './pages/Sermons';
import SignIn from './pages/SignIn';
import Store from './pages/Store';
import TopicalStudies from './pages/TopicalStudies';
import UserProfile from './pages/UserProfile';
import WritingAssistant from './pages/WritingAssistant';
import __Layout from './Layout.jsx';


export const PAGES = {
    "RiskAssessment": RiskAssessment,
    "RiskDashboard": RiskDashboard,
    "AIChat": AIChat,
    "AISettings": AISettings,
    "BibleAssistant": BibleAssistant,
    "BibleSearch": BibleSearch,
    "Churches": Churches,
    "ContactUs": ContactUs,
    "Forum": Forum,
    "Home": Home,
    "HomeSpanish": HomeSpanish,
    "KidsBibleStudy": KidsBibleStudy,
    "ManageContacts": ManageContacts,
    "Messages": Messages,
    "Notes": Notes,
    "Payments": Payments,
    "SavedContent": SavedContent,
    "Search": Search,
    "Sermons": Sermons,
    "SignIn": SignIn,
    "Store": Store,
    "TopicalStudies": TopicalStudies,
    "UserProfile": UserProfile,
    "WritingAssistant": WritingAssistant,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};