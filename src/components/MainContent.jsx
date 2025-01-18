import React from 'react'
import ChatSection from './ChatSection'
import SideMenu from './SideMenu'

const MainContent = () => {
  return (
    <div className='w-100 h-[90%] p-4 bg-slate-600 text-white flex justify-evenly items-center'>
            {/* <SideMenu />   */}
            <ChatSection />
    </div>
  )
}

export default MainContent