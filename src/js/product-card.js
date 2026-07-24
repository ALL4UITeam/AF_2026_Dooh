import { initAppSidebar } from './components/app-sidebar.js'
import { initMediaFilters } from './components/media-filters.js'

initAppSidebar()
initMediaFilters({
  itemSelector: '#product-card-grid .media-card',
})
