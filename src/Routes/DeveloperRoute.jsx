import React from 'react'
import {NavLink, Route, Routes } from 'react-router-dom'
import Admin from '../pages/Admin/Admin'
import IdCreator from '../pages/Admin/IDCreator'
import DevLayout from '../components/LayoutDev'
import EmployeeList from '../pages/Admin/EmployeeList'
import Claims from '../pages/Admin/claims'
import AdminApplications from '@/pages/Admin/ApplicantPage'
import CreateAccount from '@/pages/Admin/CreateAccount'
import ArchiveList from '@/pages/Admin/ArchiveList'

const DeveloperRoute = () => {
    return (
        <>
            <Routes>
                <Route element={<DevLayout />}>
                    <Route path="Dashboard" element={<Admin/>} />
                    <Route path="idCreator" element={<IdCreator/>} />
                    <Route path="EmployeeList" element={<EmployeeList/>} />
                    <Route path="Claims" element={<Claims/>} />
                    <Route path="Applications" element={<AdminApplications/>} />
                    <Route path="CreateAccount" element={<CreateAccount/>} />
                    <Route path="ArchiveList" element={<ArchiveList/>} />
                </Route>
            </Routes>
        </>
    )
}

export default DeveloperRoute;
