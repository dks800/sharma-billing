// import { useEffect, useState } from "react";
// import { db } from "../../firebase";
// import { collection, getDocs, query, orderBy } from "firebase/firestore";
// import AddCompanyForm from "./AddCompanyForm";

// interface Company {
//   id: string;
//   name: string;
//   gst?: string;
// }

// export default function CompanyList() {
//   const [companies, setCompanies] = useState<Company[]>([]);

//   const fetchCompanies = async () => {
//     const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));
//     const snapshot = await getDocs(q);
//     const companyData: Company[] = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Company[];
//     setCompanies(companyData);
//   };

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <AddCompanyForm onCompanyAdded={fetchCompanies} />

//       <div className="bg-gray-50 p-4 rounded-lg shadow">
//         <h2 className="text-lg font-bold mb-4">Company List</h2>
//         {companies.length === 0 ? (
//           <p className="text-gray-500">No companies yet</p>
//         ) : (
//           <ul className="divide-y">
//             {companies.map((company) => (
//               <li key={company.id} className="py-2">
//                 <span className="font-medium">{company.name}</span>
//                 {company.gst && (
//                   <span className="text-sm text-gray-500 ml-2">
//                     ({company.gst})
//                   </span>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
