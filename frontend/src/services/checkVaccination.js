import { sendEmail } from "./emailService";

export async function nextVaccination(pets) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?._id) {
    const today = new Date();

    for (const pet of pets) {
      if (pet.owner._id === user._id) {
        const nextVaccinateDate = new Date(pet.nextVaccinateDate);
        const diffDays = Math.ceil(
          (nextVaccinateDate - today) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 0 && diffDays <= 7) {
          await sendEmail({
            to: pet.owner.email,
            subject: "Upcoming Vaccination Reminder",
            text: `Dear ${
              pet.owner.name
            },\n\nThis is a reminder that your pet, ${
              pet.name
            }, has a vaccination scheduled on ${nextVaccinateDate.toDateString()}.\n\nPlease make the necessary arrangements.\n\nBest regards,\nPet Care Team`,
            html: `<p>Dear ${
              pet.owner.name
            },</p><p>This is a reminder that your pet, <strong>${
              pet.name
            }</strong>, has a vaccination scheduled on <strong>${nextVaccinateDate.toDateString()}</strong>.</p><p>Please make the necessary arrangements.</p><p>Best regards,<br>Pet Care Team</p>`,
          });
        }
      }
    }
  }
}
