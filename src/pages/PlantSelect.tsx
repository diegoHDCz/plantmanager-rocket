import React, { useEffect, useState } from 'react'
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native'
import colors from '../styles/colors'

import { Header } from '../components/Header'
import fonts from '../styles/fonts'
import { EnviromentButton } from '../components/EnviromentButton'
import { PlantCardPrimary } from '../components/PlantCardPrimary'
import { Load } from '../components/Load'
import api from '../services/api'

interface EnviromentProps {
  key: string
  title: string
}

interface PlantProps {
  id: string
  name: string
  about: string
  water_tips: string
  photo: string
  environments: [string]
  frequency: {
    times: number
    repeat_every: string
  }
}

export function PlantSelect() {
  // hooks

  const [enviroments, setEnviroments] = useState<EnviromentProps[]>([])
  const [plants, setPlants] = useState<PlantProps[]>([])
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([])
  const [environmentSelected, setEnvironmentSelected] = useState('all')
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  function handleEnvironmentSelected(environment: string) {
    setEnvironmentSelected(environment)

    if (environment == 'all') {
      return setFilteredPlants(plants)
    } else {
      const filtered = plants.filter((plant) =>
        plant.environments.includes(environment)
      )
      setFilteredPlants(filtered)
    }
  }
  async function fetchPlants() {
    const { data } = await api.get(
      `plants?_sort=name&_order=asc&_page=${page}&_limit=8`
    )

    if (!data) {
      return setLoading(true)
    } else if (page > 1) {
      setPlants((oldValue) => [...oldValue, ...data])
      setFilteredPlants((oldValue) => [...oldValue, ...data])
    } else {
      setPlants(data)
      setFilteredPlants(data)
    }
    setLoading(false)
    setLoadingMore(false)
  }

  function handleFetchMore(distance: number) {
    if (distance < 1) {
      return
    } else {
      setLoadingMore(true)
      setPage((oldValue) => oldValue + 1)
      fetchPlants()
    }
  }

  useEffect(() => {
    async function fetchEnviroment() {
      const { data } = await api.get(
        'plants_environments?_sort=title&order=asc'
      )
      setEnviroments([
        {
          key: 'all',
          title: 'Todos'
        },
        ...data
      ])
    }

    fetchEnviroment()
  }, [])

  useEffect(() => {
    fetchPlants()
  }, [])

  if (loading) {
    return <Load />
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header />
          <Text style={styles.title}>Em qual Ambiente?</Text>
          <Text style={styles.subtitle}>Você quer colocar sua planta?</Text>
        </View>

        <View>
          <FlatList
            data={enviroments}
            renderItem={({ item }) => (
              <EnviromentButton
                title={item.title}
                active={item.key === environmentSelected}
                onPress={() => handleEnvironmentSelected(item.key)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.enviromentList}
          />

          <View style={styles.plants}>
            <FlatList
              data={filteredPlants}
              renderItem={({ item }) => <PlantCardPrimary data={item} />}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              onEndReachedThreshold={0.1}
              onEndReached={({ distanceFromEnd }) =>
                handleFetchMore(distanceFromEnd)
              }
              ListFooterComponent={
                loadingMore ? <ActivityIndicator color={colors.green} /> : <></>
              }
            />
          </View>
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    paddingHorizontal: 30
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading
  },
  enviromentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    marginLeft: 32,
    marginVertical: 32
  },
  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center'
  }
})