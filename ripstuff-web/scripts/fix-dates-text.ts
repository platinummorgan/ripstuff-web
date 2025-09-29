import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDatesText() {
  try {
    // Find the problematic grave
    const grave = await prisma.grave.findFirst({
      where: { 
        slug: 'my-day-1-playstation-5-i5bekv'
      },
      select: {
        id: true,
        title: true,
        datesText: true,
        createdAt: true,
      }
    })
    
    if (!grave) {
      console.log('Grave not found')
      return
    }
    
    console.log('Current grave data:')
    console.log('Title:', grave.title)
    console.log('Current datesText:', grave.datesText)
    console.log('Created at:', grave.createdAt)
    
    // Calculate correct time ago
    const now = new Date()
    const created = new Date(grave.createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    console.log('Days since creation:', diffDays)
    
    // Update with null to remove the incorrect datesText
    await prisma.grave.update({
      where: { id: grave.id },
      data: { 
        datesText: null  // Remove the incorrect "1770 days" text
      }
    })
    
    console.log('✅ Fixed! Removed incorrect datesText. The page will now show proper date formatting.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDatesText()