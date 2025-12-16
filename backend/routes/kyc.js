const express = require("express");
const router = express.Router();
const FleetOwner = require("../models/Fleetowner");
const FranchisePartner = require("../models/FranchiseRegestriationSchema");
const {updateDocumentStatus,updateApplicationStatus,getApplicationById,requestDocuments,completeStep1,getApplicationByNumber} = require('../api/application')
// GET full details for KYC Verification

router.get('/application/:id',getApplicationByNumber);

router.post("/document/status", updateDocumentStatus);

router.post("/application/status", updateApplicationStatus);

router.post('/document/request',requestDocuments);

router.post('/step1/complete',completeStep1);
// Normalizer for Franchise Partner
function normalizeFranchise(item) {
    return {
        id: item.applicationNumber,
        name: item.fullName,
        businessName: item.businessName,
        mobile: item.mobile,
        email: item.email,
        address: item.address,
        state: item.state,
        city: item.city,
        pinCode: item.pinCode,
        franchiseType: item.franchiseType,
        shopSize: item.shopSize,
        locationType: item.locationType,
        facilities: item.facilities,
        investmentCapacity: item.investmentCapacity,
        staffCount: item.staffCount,
        priorExperience: item.priorExperience,
        documents: {
            applicantPhoto: item.applicantPhoto,
            aadhaarCopy: item.aadhaarCopy,
            panCopy: item.panCopy,
            gstCertificate: item.gstCertificate,
            shopOwnershipDoc: item.shopOwnershipDoc
        },
        bank: {
            bankName: item.bankName,
            bankBranch: item.bankBranch,
            ifsc: item.ifsc,
            accountNumber: item.accountNumber,
            accountHolder: item.accountHolder
        },
        status: item.status,
        feeStatus: item.feeStatus,
        feeAmount: item.feeAmount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };
}

// Normalizer for Fleet Owner
function normalizeFleet(item) {
    return {
        id: item.applicationNumber,
        name: item.fullName,
        mobile: item.mobile,
        email: item.email,
        address: item.address,
        aadhaar: item.aadhaar,
        pan: item.pan,
        gst: item.gst,
        documents: {
            aadhaarFile: item.aadhaarFile,
            panFile: item.panFile,
            rcFile: item.rcFile,
            insuranceFile: item.insuranceFile,
            fitnessFile: item.fitnessFile
        },
        fleet: {
            trucksCount: item.trucksCount,
            trucks: item.trucks
        },
        bank: {
            bankName: item.bankName,
            ifsc: item.ifsc,
            accountNumber: item.accountNumber,
            accountHolder: item.accountHolder
        },
        status: item.status,
        feeStatus: item.feeStatus,
        feeAmount: item.feeAmount,
        submittedAt: item.submittedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };
}

module.exports = router;