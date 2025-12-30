import Home from './pages/Home';
import BibleSearch from './pages/BibleSearch';
import Notes from './pages/Notes';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BibleSearch": BibleSearch,
    "Notes": Notes,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};