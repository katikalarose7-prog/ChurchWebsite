import AdminResourceManager from './AdminResourceManager.jsx';
import { PiChalkboardTeacherBold } from 'react-icons/pi';

export default function ManageSundayStudents() {
  return (
    <AdminResourceManager
      title="Sunday School Students"
      endpoint="/sunday-school/students"
      emptyIcon={PiChalkboardTeacherBold}
      renderItem={(s) => s.name}
renderMeta={(s) => `${s.gender ? s.gender + ' · ' : ''}${s.class}${s.phone ? ' · ' + s.phone : ''}${s.isActive === false ? ' · Inactive' : ''}`}      fields={[
        { name: 'name', label: 'Student Name', required: true },
           {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          options: ['Boy', 'Girl'],
        },
        {
          name: 'class',
          label: 'Class',
          type: 'select',
          required: true,
          options: ['Beginners', 'Primary', 'Juniors', 'Seniors'],
        },
        { name: 'phone', label: 'Phone Number' },
        { name: 'parentName', label: "Parent/Guardian Name" },
        { name: 'address', label: 'Address' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
        { name: 'isActive', label: 'Active (still attending)', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}
