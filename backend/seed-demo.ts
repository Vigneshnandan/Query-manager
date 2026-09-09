import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function seedDemo() {
  try {
    console.log("🌱 Starting demo seed...\n");

    // 1. Create citizen user and profile
    console.log("Creating citizen profile...");
    const citizenAuthResponse = await supabase.auth.admin.createUser({
      email: "citizen@demo.com",
      password: "demo123456",
      email_confirm: true,
    });

    if (citizenAuthResponse.error) throw citizenAuthResponse.error;
    const citizenId = citizenAuthResponse.data.user!.id;

    await supabase.from("profiles").insert({
      id: citizenId,
      name: "Demo Citizen",
      role: "citizen",
      department: null,
    });

    console.log(`✓ Citizen created: ${citizenId} (citizen@demo.com)\n`);

    // 2. Create officers and dept heads across departments
    const departments = ["Water", "Electricity", "Sanitation"];
    const createdOfficers: { [key: string]: string } = {};

    for (const dept of departments) {
      // Create dept head
      console.log(`Creating dept_head for ${dept}...`);
      const deptHeadAuthResponse = await supabase.auth.admin.createUser({
        email: `depthead-${dept.toLowerCase()}@demo.com`,
        password: "demo123456",
        email_confirm: true,
      });

      if (deptHeadAuthResponse.error) throw deptHeadAuthResponse.error;
      const deptHeadId = deptHeadAuthResponse.data.user!.id;

      await supabase.from("profiles").insert({
        id: deptHeadId,
        name: `${dept} Dept Head`,
        role: "dept_head",
        department: dept,
      });

      console.log(`✓ Dept head created for ${dept}: ${deptHeadId}\n`);

      // Create officer
      console.log(`Creating officer for ${dept}...`);
      const officerAuthResponse = await supabase.auth.admin.createUser({
        email: `officer-${dept.toLowerCase()}@demo.com`,
        password: "demo123456",
        email_confirm: true,
      });

      if (officerAuthResponse.error) throw officerAuthResponse.error;
      const officerId = officerAuthResponse.data.user!.id;

      await supabase.from("profiles").insert({
        id: officerId,
        name: `${dept} Officer`,
        role: "officer",
        department: dept,
      });

      createdOfficers[dept] = officerId;
      console.log(`✓ Officer created for ${dept}: ${officerId}\n`);
    }

    // 3. Create sample ticket with 3 issues across departments
    console.log("Creating sample ticket...");
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        citizen_id: citizenId,
        raw_text:
          "There is no water supply in our street for 5 days, also the street lights on MG road have not worked for 2 weeks, and the drainage is clogged",
        photo_url: null,
        location: "Main Street, City Center",
      })
      .select();

    if (ticketError) throw ticketError;
    const ticketId = ticketData[0].id;
    console.log(`✓ Ticket created: ${ticketId}\n`);

    // 4. Create 3 issues across different departments
    const now = new Date();
    const pastDeadline = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

    const issuesData = [
      {
        parent_ticket_id: ticketId,
        department: "Water",
        issue_text: "No water supply in our street for 5 days",
        deadline: null,
        priority: "high",
        assigned_officer_id: createdOfficers["Water"],
        status: "assigned",
        sla_deadline: pastDeadline.toISOString(), // OVERDUE for demo
      },
      {
        parent_ticket_id: ticketId,
        department: "Electricity",
        issue_text: "Street lights on MG road have not worked for 2 weeks",
        deadline: null,
        priority: "high",
        assigned_officer_id: null,
        status: "new",
        sla_deadline: null,
      },
      {
        parent_ticket_id: ticketId,
        department: "Sanitation",
        issue_text: "Drainage is clogged",
        deadline: null,
        priority: "medium",
        assigned_officer_id: null,
        status: "new",
        sla_deadline: null,
      },
    ];

    console.log("Creating sample issues...");
    const { error: issuesError } = await supabase
      .from("issues")
      .insert(issuesData);

    if (issuesError) throw issuesError;
    console.log(`✓ Created 3 issues across departments\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ DEMO SEED COMPLETE!\n");
    console.log("📊 Demo Data Created:");
    console.log(`  • 1 Citizen: citizen@demo.com / demo123456`);
    console.log(`  • 3 Dept Heads (one per department)`);
    console.log(`    - depthead-water@demo.com / demo123456`);
    console.log(`    - depthead-electricity@demo.com / demo123456`);
    console.log(`    - depthead-sanitation@demo.com / demo123456`);
    console.log(`  • 3 Officers (one per department)`);
    console.log(`    - officer-water@demo.com / demo123456`);
    console.log(`    - officer-electricity@demo.com / demo123456`);
    console.log(`    - officer-sanitation@demo.com / demo123456`);
    console.log(`  • 1 Sample Ticket with 3 Issues`);
    console.log(
      `    - Water issue: ASSIGNED & OVERDUE (for SLA escalation demo)\n`
    );
    console.log("🎯 Demo Flow:");
    console.log("  1. Login as Water Dept Head → See overdue Water issue");
    console.log("  2. Click 'Run SLA Check' → Watch it escalate live!");
    console.log("  3. Login as Water Officer → Mark issue resolved");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedDemo();
