import React, { useEffect } from 'react'
import PropertiesPage from '../components/properties/Propertiespage'
import { restoreScrollPosition } from '../utils/scrollRestoration'

const Properties = () => {
  useEffect(() => {
    restoreScrollPosition('propertiesScrollPos');
  }, []);

  return (
    <div>
      <PropertiesPage />
    </div>
  )
}

export default Properties




