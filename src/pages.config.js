import Home from './pages/Home';
import BibleSearch from './pages/BibleSearch';
import Notes from './pages/Notes';
import AIChat from './pages/AIChat';
import TeamProjects from './pages/TeamProjects';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BibleSearch": BibleSearch,
    "Notes": Notes,
    "AIChat": AIChat,
    "TeamProjects": TeamProjects,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};