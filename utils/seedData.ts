import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const SEWADARS = [
  { id: "002a7f8d-6986-4deb-9a54-ba00a50d3462", name: "Nirmal Chhagani", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "03f03982-c3dc-4d3f-afc0-1457fa1a17dd", name: "Mohinder Pal Singh Oberoi", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "07c44cd4-9060-4553-8be5-f5878be67fc9", name: "Shivani", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "0dbb126f-9c33-4367-bd47-13c9871f7ebf", name: "Pradeep Nagpal", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "0e5e32f5-da77-413e-84f1-842c890b368a", name: "H. K. Goel", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "1070c23a-f1b5-4041-9fa6-32e0cc8a5b25", name: "Jitender Jain", created_at: "2026-02-27 08:23:37.031938+00" },
  { id: "17ebd5d3-fdb5-4716-b4b3-63bb6c65d4a8", name: "Raj Kumar", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "1acc7954-511a-4ad7-8b88-eb2e43ebce96", name: "V. K. Talwar", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "1da8c13d-9c4a-40c8-a6f6-e686c76c0a41", name: "D K Bhasin", created_at: "2026-02-27 08:13:22.977348+00" },
  { id: "21adc4ad-c444-4141-aad7-da2a1243775e", name: "Raj Goel", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "2316e388-241f-472b-9986-07d772d1eace", name: "Teena Sharma", created_at: "2026-02-27 08:12:08.066567+00" },
  { id: "25daaf52-bb80-48a6-b7b9-1f21bb132363", name: "Ram Nanvani", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "27850fcf-79ff-4cbc-8a1e-87fa79ee4d20", name: "Vrinda Dang", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "28101b86-3037-41a3-bd75-347aa911499e", name: "Rajinder Gandhi", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "281396bc-0936-4817-bbfe-f3f9f0df5150", name: "Neha Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "2ba78632-c6e8-48d7-b6f0-685d07fd6421", name: "Savita Gupta", created_at: "2026-02-27 08:09:11.624194+00" },
  { id: "2bbb5cdd-f1f4-40d9-a466-7b0e3926048b", name: "Anita Saini", created_at: "2026-02-27 08:04:30.018549+00" },
  { id: "2df7a419-6174-4baf-b2dd-805cc3b61ddd", name: "Harish Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "30b81b82-5abb-46a6-9557-54ba01ebcd75", name: "Deepak Goel", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "39212211-f0e4-4b3b-8a5a-c6240a8f84a4", name: "Rajinder Pd. Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "418557c8-6055-4756-8c5b-b1fae21fa85f", name: "Vijay Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "4331fb2c-cc31-4479-aa04-3b1f4ccd7494", name: "Sadhna Babbar", created_at: "2026-02-27 08:14:17.682791+00" },
  { id: "461091de-4f85-40fc-9a5a-6a307a6dfb3d", name: "Gulshan Sachdeva", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "4655dc16-c672-4b2e-8268-9b6f1f60fe23", name: "Meenakshi Arora", created_at: "2026-02-27 08:32:40.484611+00" },
  { id: "47df19e0-e5fd-442e-9b96-3186c2d2c318", name: "Kanwal Malik", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "497ce201-e1c6-4514-90b6-3db3313809ec", name: "P. K. Sardana", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "4a0e7206-26a1-4186-a1be-83a05ef1a812", name: "Anita Arora", created_at: "2026-02-27 08:09:53.733063+00" },
  { id: "52ef05e7-340f-4321-adea-51d8e90e4184", name: "Sunil Kumar Arora", created_at: "2026-02-27 08:21:52.931996+00" },
  { id: "53b89c21-9bfd-4e4e-b53a-8143d034bd19", name: "Pankaj Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "560c988d-fecd-4081-a2d4-a1cf9d4c5da4", name: "Basant Gandhi", created_at: "2026-02-27 08:17:39.587651+00" },
  { id: "5701c5d6-cef6-4eae-866b-ba11006f07a6", name: "Naina Chabra", created_at: "2026-02-15 12:37:35.896889+00" },
  { id: "57a99e7d-8852-4bd1-ad7c-3ea39f2d2e99", name: "Pooja Manocha", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "58609500-e0cb-4f8a-9ee3-d96d0c5b794c", name: "Vijay Pasricha", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "5ef5e4ab-650c-4a37-b9f1-d09a471bb933", name: "Manish Malhotra", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "667f0b0c-56e6-481b-b776-968d487d2c6e", name: "Jetender Jain", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "685e86df-9118-4055-8b3a-ec46e34fb832", name: "Kanchan Dhingra", created_at: "2026-02-27 07:57:17.994118+00", phone_number: "9810211831" },
  { id: "6ef09a4e-51fe-4b89-9c43-f988557ab620", name: "S. K. Luthra", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "766048cf-4f3f-4075-b622-57a22480020f", name: "Basant Singh", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "781202d1-d2dc-4e5e-be46-998e9f32c937", name: "Sanjeev Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "792048b7-d2bf-4c85-b864-e71f34bb543d", name: "Mohit Chhabra", created_at: "2026-02-27 08:02:05.880236+00" },
  { id: "79af26e0-7e4f-4466-b634-24f269dd5491", name: "Anita Singh", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "7c34a1b4-3bf2-42b0-b164-a04e4dfc8c4b", name: "Kamlesh Nangia", created_at: "2026-02-27 08:15:53.530324+00" },
  { id: "7d377d54-2876-4ed5-b0ea-8cba2c6031aa", name: "I. K. Sodhi", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "7f1c7585-1111-424b-96c3-a2f86dcf9a59", name: "Jai Kishan Bansal", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "82b382e9-7562-4559-82f6-5bf5479bb404", name: "Neeraj Dhingra", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "86226dfa-90be-4169-a3de-fa21de7a190a", name: "Anmol Bhatia", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "869c97ff-7bdd-421e-9121-bc6f043db4fd", name: "Sonia Malhotra", created_at: "2026-02-27 08:29:13.999047+00" },
  { id: "895de085-218e-487d-93d8-3e3aafa259d8", name: "G. L. Mukhi", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "8a2c6671-33ea-4d77-8a59-dbd630ca13ce", name: "Rakesh Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "8de473f6-f41b-4147-9f3f-89624c15ccf2", name: "Seema Arora", created_at: "2026-02-27 08:03:16.146793+00" },
  { id: "8f873924-89fc-4184-91ef-dd24e5d65ee6", name: "Jai Kishan Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "98ce4ab4-f7d3-47cd-ac25-5623368ff975", name: "Tina", created_at: "2026-02-15 12:38:19.628163+00" },
  { id: "9c0d68ea-234e-45c2-97a3-a283b95cf718", name: "Devender Bhassin", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "9da7f558-56b8-4150-9b8a-4e6c9e7141d7", name: "Aditi Gupta", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "9defb9f0-377c-4f9b-ba6b-246d82425cae", name: "Rakesh Babbar", created_at: "2026-02-27 08:20:41.507444+00" },
  { id: "9f2be917-4e89-41c1-bd2b-8b78fc577606", name: "Bikram Singh", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "a017addc-2be3-48e5-8fdf-989e9212a0de", name: "Shruti", created_at: "2026-02-27 08:26:43.30661+00" },
  { id: "a077db97-2c1e-48c6-acab-da4f0024ebad", name: "Sonal", created_at: "2026-02-27 08:22:57.541001+00" },
  { id: "a2f860f7-da43-4f11-b3b5-b8f73119ac03", name: "Kuldeep Ahuja", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "a798a8c1-39b8-4790-b8a7-6ab3a459c362", name: "Pooja Goel", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "a8e27867-c166-4990-9623-48e54536e93b", name: "Harish Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "ac5f058e-42c8-4d2d-afd1-c866ccc7b986", name: "Vipin Gupta", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "add1330d-ee79-4caf-a6e7-93a398941bcc", name: "Meenakshi Madan", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "b7c4e592-19f5-44c4-956a-6e64ea9db3dd", name: "Parveen Gandhi", created_at: "2026-02-27 08:31:37.148989+00" },
  { id: "ba2782e5-e835-4880-a59f-81dfd7aa6c62", name: "Reena Anand", created_at: "2026-02-27 08:24:26.438306+00" },
  { id: "c5bb0381-5f53-4049-8e45-94655efb2e90", name: "Rakesh Gulati", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "c6c0e9f1-bb3b-4852-8a79-b48291631fd4", name: "Raj Kumar Goel", created_at: "2026-02-27 16:35:11.082822+00" },
  { id: "c7accc65-650b-4f81-b7be-b32b7ba2e7ce", name: "Ashish Pasricha", created_at: "2026-02-27 08:53:53.484911+00" },
  { id: "c8248b47-5656-4dd5-9b09-723edb4fbc7d", name: "Kusum Adlakha", created_at: "2026-02-27 07:58:54.538922+00" },
  { id: "cef75a7b-1ffd-495d-9adf-48bf77f46587", name: "Khushboo Gupta", created_at: "2026-02-27 08:25:45.973106+00" },
  { id: "cf449f26-7a8d-4971-8b0c-20f9b27686fe", name: "Himani Bansal", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "d77c07b1-f837-4200-960f-69f408b6ccc2", name: "Bhupinder Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "d84fcc28-5105-4f5b-b555-9f925df2e233", name: "Shubham Sehgal", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "dc464cf5-9fef-4ea1-aad5-2b0bee45d50a", name: "Kavita Chitkara", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "e0f395bf-0bb0-4507-9dfc-a1bf167a40c4", name: "Shifali Shriswal", created_at: "2026-02-27 08:11:21.292473+00" },
  { id: "e204ea34-2f30-43f4-a2f4-258fcdb532cc", name: "R. K. Arora", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "ebbd7b66-de7e-4a85-9420-5f8be6caa7d4", name: "Raj Kumar Dhall", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "f4555fab-b99a-442e-bf92-6ed555101c21", name: "Rajinder Kumar Sehgal", created_at: "2026-02-08 09:25:30.971405+00" },
  { id: "fb2dbc57-4b53-420d-a02f-a727191f0645", name: "Sheena Gulati", created_at: "2026-02-27 08:36:35.11547+00" },
  { id: "fc9507fa-d424-46d1-938e-faaa0beb022c", name: "Sapna", created_at: "2026-02-27 08:06:02.395948+00" },
  { id: "ff207a21-be2b-4251-bbbf-98235fdbfa84", name: "Subhash Nangia", created_at: "2026-02-08 09:25:30.971405+00" }
];

export const seedDatabase = async () => {
  try {
    const sewadarsCollection = collection(db, "sewadars");
    const snapshot = await getDocs(sewadarsCollection);
    
    if (snapshot.empty) {
      console.log("Seeding database with provided sewadars...");
      const promises = SEWADARS.map(sewadar => {
        const { id, ...data } = sewadar;
        return setDoc(doc(db, "sewadars", id), data);
      });
      await Promise.all(promises);
      console.log("Database seeded successfully!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
};
