import * as Yup from 'yup';
export const addNewShiftSchema = Yup.object().shape({
    day: Yup.string()
        .required('يجب إدخال اليوم')
    // .matches(/^\d{4}-\d{2}-\d{2}$/, 'يجب أن يكون اليوم بصيغة YYYY-MM-DD'),
    ,
    departmentId: Yup.string()
        .required('يجب إدخال القسم')
    ,        // .matches(/^[a-zA-Z0-9]{24}$/, 'يجب أن يكون معرف القسم مكونًا من 24 حرفًا'),

    endHour: Yup.string()
        .required('يجب إدخال ساعة النهاية')
    ,        // .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'يجب أن تكون ساعة النهاية بصيغة HH:mm'),

    startHour: Yup.string()
        .required('يجب إدخال ساعة البداية')
    ,        // .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'يجب أن تكون ساعة البداية بصيغة HH:mm'),

    userId: Yup.string()
        .required('يجب إدخال المستخدم')
    ,        // .matches(/^[a-zA-Z0-9]{24}$/, 'يجب أن يكون معرف المستخدم مكونًا من 24 حرفًا'),
});