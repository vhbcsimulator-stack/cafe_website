import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations.json");

export async function GET() {
    try {
        let registrations = [];
        try {
            const fileData = await fs.readFile(REGISTRATIONS_FILE, "utf-8");
            registrations = JSON.parse(fileData);
        } catch (err) {}
        const totalRegisteredCount = registrations.reduce((sum: number, reg: any) => sum + (reg.membershipQuantity || 1), 0);
        return NextResponse.json({
            totalRegisteredCount,
            slotsRemaining: Math.max(0, 100 - totalRegisteredCount)
        });
    } catch (err) {
        return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
    }
}

// Helper to normalize Philippine mobile numbers
function normalizePhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    
    if (digits.startsWith("639") && digits.length === 12) {
        return "0" + digits.slice(2);
    }
    if (digits.startsWith("09") && digits.length === 11) {
        return digits;
    }
    if (digits.startsWith("9") && digits.length === 10) {
        return "0" + digits;
    }
    return phone;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            firstName,
            lastName,
            mobileNumber,
            email,
            address,
            preferredClaimDate,
            preferredClaimTime,
            membershipQuantity,
            message,
            consentAccuracy,
            consentClaim,
            consentPrivacy
        } = body;

        // 1. Server-side Validation
        if (!firstName?.trim()) return NextResponse.json({ error: "Please enter your first name." }, { status: 400 });
        if (!lastName?.trim()) return NextResponse.json({ error: "Please enter your last name." }, { status: 400 });
        if (!mobileNumber?.trim()) return NextResponse.json({ error: "Please enter your mobile number." }, { status: 400 });
        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }
        if (!address?.trim()) return NextResponse.json({ error: "Please enter your complete address." }, { status: 400 });
        if (!preferredClaimDate?.trim()) return NextResponse.json({ error: "Please select your preferred claiming date." }, { status: 400 });
        if (!preferredClaimTime?.trim()) return NextResponse.json({ error: "Please select your preferred claiming time." }, { status: 400 });
        
        const qty = parseInt(membershipQuantity, 10);
        if (isNaN(qty) || qty < 1) {
            return NextResponse.json({ error: "Membership quantity must be at least 1." }, { status: 400 });
        }

        if (!consentAccuracy || !consentClaim || !consentPrivacy) {
            return NextResponse.json({ error: "You must accept all required consent agreements." }, { status: 400 });
        }

        // Validate PH mobile format
        const normalizedPhone = normalizePhoneNumber(mobileNumber);
        if (!/^09\d{9}$/.test(normalizedPhone)) {
            return NextResponse.json({ error: "Please enter a valid Philippine mobile number (e.g., 09171234567)." }, { status: 400 });
        }

        // 2. Read current registrations
        let registrations = [];
        try {
            const fileData = await fs.readFile(REGISTRATIONS_FILE, "utf-8");
            registrations = JSON.parse(fileData);
        } catch (err: any) {
            // File doesn't exist yet or is empty, which is fine
        }

        // 3. Check availability limit (100 members)
        const totalRegisteredCount = registrations.reduce((sum: number, reg: any) => sum + (reg.membershipQuantity || 1), 0);
        if (totalRegisteredCount + qty > 100) {
            return NextResponse.json({ 
                error: "The first 100 membership slots have been filled. Registration is currently closed." 
            }, { status: 423 });
        }

        // 4. Generate unique reference code
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const referenceCode = `VHC-MEM-${randomDigits}`;

        // 5. Create new registration record
        const newRecord = {
            promotion: "VHermosa Cafe Membership",
            membershipFee: 999, // Server-side official price
            membershipDuration: "1 Year",
            referenceCode,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            mobileNumber: normalizedPhone,
            email: email.trim(),
            address: address.trim(),
            preferredClaimDate,
            preferredClaimTime,
            membershipQuantity: qty,
            message: message?.trim() || "",
            claimMethod: "Physical claim at VHermosa Cafe",
            source: "Cafe Membership Promo Page",
            submittedAt: new Date().toISOString()
        };

        registrations.push(newRecord);

        // 6. Write back to local registrations.json file
        await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 4), "utf-8");

        return NextResponse.json({
            success: true,
            referenceCode
        });

    } catch (err) {
        console.error("Error processing registration:", err);
        return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
    }
}
