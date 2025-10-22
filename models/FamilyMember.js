const { pool } = require("../config/database");

class FamilyMember {
  static async getAllByPersonalInfoId(personalInfoId) {
    try {
      const [rows] = await pool.execute(
        `
        SELECT * FROM family_members 
        WHERE personal_info_id = ?
        ORDER BY relationship, name
      `,
        [personalInfoId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting family members:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM family_members WHERE id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting family member by id:", error);
      throw error;
    }
  }

  static async create(familyMemberData) {
    try {
      const insertQuery = `
        INSERT INTO family_members (
          personal_info_id, name, relationship, age, occupation, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        familyMemberData.personal_info_id,
        familyMemberData.name,
        familyMemberData.relationship,
        familyMemberData.age || null,
        familyMemberData.occupation || null,
        familyMemberData.notes || null,
      ];

      const [result] = await pool.execute(insertQuery, values);
      return result.insertId;
    } catch (error) {
      console.error("Error creating family member:", error);
      throw error;
    }
  }

  static async update(id, familyMemberData) {
    try {
      const updateQuery = `
        UPDATE family_members SET 
          name = ?, relationship = ?, age = ?, occupation = ?, notes = ?
        WHERE id = ?
      `;

      const values = [
        familyMemberData.name,
        familyMemberData.relationship,
        familyMemberData.age || null,
        familyMemberData.occupation || null,
        familyMemberData.notes || null,
        id,
      ];

      const [result] = await pool.execute(updateQuery, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating family member:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM family_members WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting family member:", error);
      throw error;
    }
  }

  static async deleteAllByPersonalInfoId(personalInfoId) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM family_members WHERE personal_info_id = ?",
        [personalInfoId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting family members:", error);
      throw error;
    }
  }
}

module.exports = FamilyMember;
