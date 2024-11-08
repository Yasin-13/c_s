"use client"
import { useState, useEffect } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shirt, ShoppingBag, Users, DollarSign, TrendingUp, Moon, Sun } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface Customer {
  Age: number
  'Purchase Amount (USD)': number
  'Review Rating': number
  'Previous Purchases': number
  Gender: string
  Category: string
  Season: string
  'Subscription Status': string
  'Shipping Type': string
  'Discount Applied': string
  'Promo Code Used': string
  'Payment Method': string
  'Frequency of Purchases': string
  Location: string  // Added Location
  cluster: number
}

export function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)  // For location filter
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    fetch('http://localhost:5000/get-clusters')
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          setCustomers(data)
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesCluster = selectedCluster !== null ? customer.cluster === selectedCluster : true
    const matchesLocation = selectedLocation !== null ? customer.Location === selectedLocation : true
    return matchesCluster && matchesLocation
  })

  const clusterCounts = customers.reduce((acc, customer) => {
    acc[customer.cluster] = (acc[customer.cluster] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const locationCounts = customers.reduce((acc, customer) => {
    acc[customer.Location] = (acc[customer.Location] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieChartData = {
    labels: Object.keys(clusterCounts),
    datasets: [
      {
        data: Object.values(clusterCounts),
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        hoverBackgroundColor: ['#FF8787', '#6EDFD1', '#5EC2D9', '#FFB59F']
      }
    ]
  }

  const locationPieChartData = {
    labels: Object.keys(locationCounts),
    datasets: [
      {
        data: Object.values(locationCounts),
        backgroundColor: ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845'],
        hoverBackgroundColor: ['#FFCD66', '#FF6E5A', '#FF4D73', '#9E1530', '#722a5d']
      }
    ]
  }

  const getAverageAge = (cluster: number | null) => {
    const relevantCustomers = cluster !== null
      ? customers.filter(c => c.cluster === cluster)
      : customers
    const sum = relevantCustomers.reduce((acc, c) => acc + c.Age, 0)
    return (sum / relevantCustomers.length).toFixed(2)
  }

  const getAveragePurchaseAmount = (cluster: number | null) => {
    const relevantCustomers = cluster !== null
      ? customers.filter(c => c.cluster === cluster)
      : customers
    const sum = relevantCustomers.reduce((acc, c) => acc + c['Purchase Amount (USD)'], 0)
    return (sum / relevantCustomers.length).toFixed(2)
  }

  const getCategoryDistribution = (cluster: number | null) => {
    const relevantCustomers = cluster !== null
      ? customers.filter(c => c.cluster === cluster)
      : customers
    const distribution = relevantCustomers.reduce((acc, c) => {
      acc[c.Category] = (acc[c.Category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return distribution
  }

  const categoryDistribution = getCategoryDistribution(selectedCluster)
  const categoryChartData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        label: 'Category Distribution',
        data: Object.values(categoryDistribution),
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#C7F464'],
      }
    ]
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Customer Segmentation</h1>
            <div className="flex items-center space-x-2">
              <Sun className="h-6 w-6 text-foreground" />
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-6 w-6 text-foreground" />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-7 mb-5">
            <Card>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center">
                  <Users className="mr-2" />
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{customers.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center">
                  <Shirt className="mr-2" />
                  Average Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{getAverageAge(selectedCluster)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2" />
                  Avg Purchase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${getAveragePurchaseAmount(selectedCluster)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" />
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Object.entries(categoryDistribution).sort((a, b) => b[1] - a[1])[0][0]}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie data={pieChartData} options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: darkMode ? 'white' : 'black'
                        }
                      }
                    }
                  }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie data={locationPieChartData} options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: darkMode ? 'white' : 'black'
                        }
                      }
                    }
                  }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>
                Filter by segment and location:
                <div className="flex gap-4 mt-2">
                  <Select onValueChange={(value) => setSelectedCluster(value === "all" ? null : parseInt(value))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Segments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      {Object.keys(clusterCounts).map((cluster) => (
                        <SelectItem key={cluster} value={cluster}>Segment {cluster}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => setSelectedLocation(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {Object.keys(locationCounts).map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Purchase Amount</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Segment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.slice(0, 10).map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{customer.Age}</TableCell>
                        <TableCell>{customer.Gender}</TableCell>
                        <TableCell>{customer.Category}</TableCell>
                        <TableCell>${customer['Purchase Amount (USD)'].toFixed(2)}</TableCell>
                        <TableCell>{customer.Location}</TableCell>
                        <TableCell>{customer.cluster}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
