import React, { useEffect } from 'react'
import PropertiesPage from '../components/properties/Propertiespage'
import { restoreScrollPosition } from '../utils/scrollRestoration'

const Properties = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      restoreScrollPosition('propertiesScrollPos');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <PropertiesPage />
    </div>
  )
}

export default Properties




