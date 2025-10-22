const { pool } = require("../config/database");

class PersonalInfo {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM personal_info 
        ORDER BY created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error getting all personal info:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM personal_info WHERE id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting personal info by id:", error);
      throw error;
    }
  }

  static async create(personalInfo) {
    try {
      const insertQuery = `
        INSERT INTO personal_info (
          date, full_name, address_line1, address_line2, 
          city, postal_code, mobile, 
          identity_card, civil_status, spouse_name, 
          children_count, residence_type, profession,
          special_need_child_name, special_need_child_age, special_need_child_school,
          special_need_details, non_related_people_count, non_related_people_details,
          sandha_member, sandha_amount, donation_amount, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        personalInfo.date,
        personalInfo.full_name,
        personalInfo.address_line1,
        personalInfo.address_line2,
        personalInfo.city,
        personalInfo.postal_code,
        personalInfo.mobile,
        personalInfo.identity_card,
        personalInfo.civil_status,
        personalInfo.spouse_name,
        personalInfo.children_count,
        personalInfo.residence_type,
        personalInfo.profession,
        personalInfo.special_need_child_name,
        personalInfo.special_need_child_age,
        personalInfo.special_need_child_school,
        personalInfo.special_need_details,
        personalInfo.non_related_people_count,
        personalInfo.non_related_people_details,
        personalInfo.sandha_member,
        personalInfo.sandha_amount,
        personalInfo.donation_amount,
        personalInfo.notes,
      ];

      const [result] = await pool.execute(insertQuery, values);
      return result.insertId;
    } catch (error) {
      console.error("Error creating personal info:", error);
      throw error;
    }
  }

  static async update(id, personalInfo) {
    try {
      const updateQuery = `
        UPDATE personal_info SET 
          date = ?, full_name = ?, address_line1 = ?, 
          address_line2 = ?, city = ?, 
          postal_code = ?, mobile = ?, 
          identity_card = ?, civil_status = ?, 
          spouse_name = ?, children_count = ?, residence_type = ?, 
          profession = ?, special_need_child_name = ?, special_need_child_age = ?,
          special_need_child_school = ?, special_need_details = ?, non_related_people_count = ?,
          non_related_people_details = ?, sandha_member = ?, sandha_amount = ?, 
          donation_amount = ?, notes = ?
        WHERE id = ?
      `;

      const values = [
        personalInfo.date,
        personalInfo.full_name,
        personalInfo.address_line1,
        personalInfo.address_line2,
        personalInfo.city,
        personalInfo.postal_code,
        personalInfo.mobile,
        personalInfo.identity_card,
        personalInfo.civil_status,
        personalInfo.spouse_name,
        personalInfo.children_count,
        personalInfo.residence_type,
        personalInfo.profession,
        personalInfo.special_need_child_name,
        personalInfo.special_need_child_age,
        personalInfo.special_need_child_school,
        personalInfo.special_need_details,
        personalInfo.non_related_people_count,
        personalInfo.non_related_people_details,
        personalInfo.sandha_member,
        personalInfo.sandha_amount,
        personalInfo.donation_amount,
        personalInfo.notes,
        id,
      ];

      const [result] = await pool.execute(updateQuery, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating personal info:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM personal_info WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting personal info:", error);
      throw error;
    }
  }

  static async findByIdentityCard(identityCard) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM personal_info WHERE identity_card = ?",
        [identityCard]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding personal info by identity card:", error);
      throw error;
    }
  }
}

module.exports = PersonalInfo;
