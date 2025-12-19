"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ChevronRight, MapPin, X, User, Heart, Phone, Map, Trash2 } from "lucide-react"
import { usePatients } from "@/lib/hooks/use-patients"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState, useMemo } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { demoZones } from "@/lib/data"
import { calculateZoneInfo, getStatusConfig, type PatientStatus } from "@/lib/zone-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const statusConfig = {
  safe: { label: "SAFE AT HOME", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]" },
  monitoring: { label: "MONITORING", className: "bg-blue-500/15 text-blue-400" },
  warning: { label: "WARNING", className: "bg-orange-500/15 text-[var(--status-warning)]" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)]" },
}

interface ZoneInput {
  id: string
  name: string
  type: "safe" | "danger" | "restricted" | "routine"
  lat: string
  lng: string
  radius: string
}

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
}

export default function PatientsPage() {
  const { patients, isLoading, mutate } = usePatients()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    age: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    distinguishingFeatures: "",
    photoUrl: "",
    
    // Medical Info
    diagnosis: "",
    conditions: "",
    medications: "",
    allergies: "",
    bloodType: "O+",
    mobilityLevel: "medium",
    communicationAbility: "limited",
    
    // Behavioral
    wanderingTriggers: "",
    calmingStrategies: "",
    
    // Location
    homeLat: "37.7749",
    homeLng: "-122.4194",
  })

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "", relationship: "", phone: "" }
  ])

  const [zones, setZones] = useState<ZoneInput[]>([
    { id: "1", name: "Home", type: "safe", lat: "37.7749", lng: "-122.4194", radius: "100" }
  ])

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      dateOfBirth: "",
      height: "",
      weight: "",
      eyeColor: "",
      hairColor: "",
      distinguishingFeatures: "",
      photoUrl: "",
      diagnosis: "",
      conditions: "",
      medications: "",
      allergies: "",
      bloodType: "O+",
      mobilityLevel: "medium",
      communicationAbility: "limited",
      wanderingTriggers: "",
      calmingStrategies: "",
      homeLat: "37.7749",
      homeLng: "-122.4194",
    })
    setEmergencyContacts([{ id: "1", name: "", relationship: "", phone: "" }])
    setZones([{ id: "1", name: "Home", type: "safe", lat: "37.7749", lng: "-122.4194", radius: "100" }])
    setActiveTab("personal")
  }

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { id: Date.now().toString(), name: "", relationship: "", phone: "" }
    ])
  }

  const removeEmergencyContact = (id: string) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== id))
    }
  }

  const updateEmergencyContact = (id: string, field: string, value: string) => {
    setEmergencyContacts(emergencyContacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const addZone = () => {
    setZones([
      ...zones,
      { 
        id: Date.now().toString(), 
        name: "", 
        type: "safe", 
        lat: formData.homeLat, 
        lng: formData.homeLng, 
        radius: "50" 
      }
    ])
  }

  const removeZone = (id: string) => {
    if (zones.length > 1) {
      setZones(zones.filter(z => z.id !== id))
    }
  }

  const updateZone = (id: string, field: string, value: string) => {
    setZones(zones.map(z => 
      z.id === id ? { ...z, [field]: value } : z
    ))
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.age) {
      toast.error("Please fill in required fields (First Name, Last Name, Age)")
      setActiveTab("personal")
      return
    }

    setIsSubmitting(true)
    try {
      // Create patient
      const patientData = {
        name: `${formData.firstName} ${formData.lastName}`,
        age: parseInt(formData.age) || 75,
        location: `${formData.homeLat},${formData.homeLng}`,
        photo_url: formData.photoUrl || null,
        medical_info: {
          diagnosis: formData.diagnosis,
          medical_history: formData.conditions.split(",").map(s => s.trim()).filter(Boolean),
          medications: formData.medications.split(",").map(s => s.trim()).filter(Boolean),
          allergies: formData.allergies.split(",").map(s => s.trim()).filter(Boolean),
          blood_type: formData.bloodType,
        },
        emergency_contacts: emergencyContacts
          .filter(c => c.name && c.phone)
          .map(c => ({
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
          })),
        behavioral_patterns: {
          distinguishing_features: formData.distinguishingFeatures,
          trigger_locations: formData.wanderingTriggers.split(",").map(s => s.trim()).filter(Boolean),
          calming_strategies: formData.calmingStrategies.split(",").map(s => s.trim()).filter(Boolean),
          mobility_level: formData.mobilityLevel,
          communication_ability: formData.communicationAbility,
        },
      }

      const newPatient = await apiClient.createPatient(patientData)
      console.log("[Patients] Created patient:", newPatient)

      // Create zones for the patient
      for (const zone of zones) {
        if (zone.name && zone.lat && zone.lng) {
          try {
            await apiClient.createZone({
              patient_id: newPatient.id,
              name: zone.name,
              type: zone.type,
              coordinates: [{ lat: parseFloat(zone.lat), lng: parseFloat(zone.lng) }],
              radius: parseFloat(zone.radius) || 100,
            })
            console.log("[Patients] Created zone:", zone.name)
          } catch (zoneError) {
            console.error("[Patients] Error creating zone:", zoneError)
          }
        }
      }

      // Create initial location for the patient
      try {
        await apiClient.createLocation({
          patient_id: newPatient.id,
          latitude: parseFloat(formData.homeLat),
          longitude: parseFloat(formData.homeLng),
          accuracy: 10,
        })
        console.log("[Patients] Created initial location")
      } catch (locError) {
        console.error("[Patients] Error creating location:", locError)
      }

      await mutate()
      toast.success(`Patient ${formData.firstName} ${formData.lastName} added successfully!`)
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[Patients] Error creating patient:", error)
      toast.error(`Failed to add patient: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell title="Patients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search patients..."
              className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="bg-[var(--accent-primary)]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
              <p className="mt-4 text-[var(--text-secondary)]">Loading patients...</p>
            </div>
          </div>
        )}

        {/* Patient Cards */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredPatients.map((patient) => {
              const statusInfo = statusConfig[patient.status as keyof typeof statusConfig] || statusConfig.safe
              const fullName = `${patient.firstName} ${patient.lastName}`
              return (
                <Link key={patient.id} href={`/patients/${patient.id}`}>
                  <Card className="cursor-pointer border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all hover:border-[var(--accent-primary)]">
                    <CardContent className="flex items-center gap-6 p-6">
                      <Avatar
                        className={cn(
                          "h-16 w-16 border-[3px]",
                          patient.status === "safe"
                            ? "border-[var(--status-safe)]"
                            : patient.status === "warning"
                              ? "border-[var(--status-warning)]"
                              : patient.status === "emergency"
                                ? "border-[var(--status-urgent)]"
                                : "border-blue-400",
                        )}
                      >
                        <AvatarImage src={patient.photo || "/placeholder.svg"} />
                        <AvatarFallback>
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{fullName}</h3>
                          <Badge className={cn("uppercase", statusInfo.className)}>{statusInfo.label}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {patient.currentZone || "Unknown location"}
                          </span>
                          <span className="flex items-center gap-1">Battery: {patient.device?.batteryLevel || 100}%</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          Last seen: {patient.device?.lastUpdate ? new Date(patient.device.lastUpdate).toLocaleString() : "Unknown"}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isLoading && filteredPatients.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <p className="text-[var(--text-secondary)]">
              {searchQuery ? "No patients found matching your search" : "No patients yet"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Patient
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's information, medical details, emergency contacts, and set up monitoring zones.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="medical" className="gap-2">
                <Heart className="h-4 w-4" />
                Medical
              </TabsTrigger>
              <TabsTrigger value="contacts" className="gap-2">
                <Phone className="h-4 w-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="zones" className="gap-2">
                <Map className="h-4 w-4" />
                Zones
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="5 ft 8 in"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="165 lbs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eyeColor">Eye Color</Label>
                  <Input
                    id="eyeColor"
                    value={formData.eyeColor}
                    onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                    placeholder="Brown"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <Input
                    id="hairColor"
                    value={formData.hairColor}
                    onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                    placeholder="Gray"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distinguishingFeatures">Distinguishing Features</Label>
                <Textarea
                  id="distinguishingFeatures"
                  value={formData.distinguishingFeatures}
                  onChange={(e) => setFormData({ ...formData, distinguishingFeatures: e.target.value })}
                  placeholder="Glasses, walks with a cane, birthmark on left cheek..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo URL (optional)</Label>
                <Input
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </TabsContent>

            {/* Medical Info Tab */}
            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Alzheimer's Disease, Dementia, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="Hypertension, Type 2 Diabetes, Arthritis..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications (comma-separated)</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="Aricept 10mg, Lisinopril 20mg, Metformin 500mg..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Penicillin, Peanuts..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobilityLevel">Mobility Level</Label>
                  <Select
                    value={formData.mobilityLevel}
                    onValueChange={(value) => setFormData({ ...formData, mobilityLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Walks independently</SelectItem>
                      <SelectItem value="medium">Medium - Needs occasional assistance</SelectItem>
                      <SelectItem value="low">Low - Needs regular assistance</SelectItem>
                      <SelectItem value="wheelchair">Wheelchair user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationAbility">Communication Ability</Label>
                  <Select
                    value={formData.communicationAbility}
                    onValueChange={(value) => setFormData({ ...formData, communicationAbility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full - Communicates clearly</SelectItem>
                      <SelectItem value="limited">Limited - Some difficulty</SelectItem>
                      <SelectItem value="nonverbal">Nonverbal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wanderingTriggers">Wandering Triggers (comma-separated)</Label>
                <Textarea
                  id="wanderingTriggers"
                  value={formData.wanderingTriggers}
                  onChange={(e) => setFormData({ ...formData, wanderingTriggers: e.target.value })}
                  placeholder="Looking for deceased spouse, Wanting to go to former workplace..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calmingStrategies">Calming Strategies (comma-separated)</Label>
                <Textarea
                  id="calmingStrategies"
                  value={formData.calmingStrategies}
                  onChange={(e) => setFormData({ ...formData, calmingStrategies: e.target.value })}
                  placeholder="Favorite music, Photos of family, Gentle redirection..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Emergency Contacts Tab */}
            <TabsContent value="contacts" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Emergency Contacts</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <Card key={contact.id} className="border-[var(--border-subtle)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">Contact {index + 1}</Badge>
                        {emergencyContacts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmergencyContact(contact.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) => updateEmergencyContact(contact.id, "name", e.target.value)}
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Relationship</Label>
                          <Input
                            value={contact.relationship}
                            onChange={(e) => updateEmergencyContact(contact.id, "relationship", e.target.value)}
                            placeholder="Daughter"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Phone</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateEmergencyContact(contact.id, "phone", e.target.value)}
                            placeholder="+1 555-123-4567"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Zones Tab */}
            <TabsContent value="zones" className="space-y-4 mt-4">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                <p className="text-sm text-blue-400">
                  <strong>Tip:</strong> Set up the home location first, then add safe zones (areas where the patient is allowed) 
                  and danger zones (areas to avoid like busy roads or water).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeLat">Home Latitude</Label>
                  <Input
                    id="homeLat"
                    type="number"
                    step="0.0001"
                    value={formData.homeLat}
                    onChange={(e) => setFormData({ ...formData, homeLat: e.target.value })}
                    placeholder="37.7749"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeLng">Home Longitude</Label>
                  <Input
                    id="homeLng"
                    type="number"
                    step="0.0001"
                    value={formData.homeLng}
                    onChange={(e) => setFormData({ ...formData, homeLng: e.target.value })}
                    placeholder="-122.4194"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Monitoring Zones</Label>
                <Button type="button" variant="outline" size="sm" onClick={addZone}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Zone
                </Button>
              </div>

              <div className="space-y-4">
                {zones.map((zone, index) => (
                  <Card key={zone.id} className={cn(
                    "border-l-4",
                    zone.type === "safe" && "border-l-green-500",
                    zone.type === "danger" && "border-l-red-500",
                    zone.type === "restricted" && "border-l-orange-500",
                    zone.type === "routine" && "border-l-purple-500",
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">Zone {index + 1}</Badge>
                        {zones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeZone(zone.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Zone Name</Label>
                          <Input
                            value={zone.name}
                            onChange={(e) => updateZone(zone.id, "name", e.target.value)}
                            placeholder="Home, Park, etc."
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Zone Type</Label>
                          <Select
                            value={zone.type}
                            onValueChange={(value) => updateZone(zone.id, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="safe">🟢 Safe Zone</SelectItem>
                              <SelectItem value="routine">🟣 Routine Area</SelectItem>
                              <SelectItem value="restricted">🟠 Restricted Zone</SelectItem>
                              <SelectItem value="danger">🔴 Danger Zone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Latitude</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            value={zone.lat}
                            onChange={(e) => updateZone(zone.id, "lat", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Longitude</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            value={zone.lng}
                            onChange={(e) => updateZone(zone.id, "lng", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Radius (m)</Label>
                          <Input
                            type="number"
                            value={zone.radius}
                            onChange={(e) => updateZone(zone.id, "radius", e.target.value)}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
