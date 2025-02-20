'use client'

// Libraries
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useBoolean, useDebounceFn } from 'ahooks'
import { useQuery } from '@tanstack/react-query'

// Components
import ExternalAPIPanel from '../../components/datasets/external-api/external-api-panel'
import Datasets from './Datasets'
import DatasetFooter from './DatasetFooter'
import ApiServer from './ApiServer'
import Doc from './Doc'
import TabSliderNew from '@/app/components/base/tab-slider-new'
import TagManagementModal from '@/app/components/base/tag-management'
import TagFilter from '@/app/components/base/tag-management/filter'
import Button from '@/app/components/base/button'
import Input from '@/app/components/base/input'
import { ApiConnectionMod } from '@/app/components/base/icons/src/vender/solid/development'
import CheckboxWithLabel from '@/app/components/datasets/create/website/base/checkbox-with-label'
// import DatasetMetadataDrawer from '@/app/components/datasets/metadata/dataset-metadata-drawer'
import MetaDataDocument from '@/app/components/datasets/metadata/metadata-document'
// Services
import { fetchDatasetApiBaseUrl } from '@/service/datasets'

// Hooks
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import { useAppContext } from '@/context/app-context'
import { useExternalApiPanel } from '@/context/external-api-panel-context'
import { DataType } from '@/app/components/datasets/metadata/types'

const Container = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { currentWorkspace, isCurrentWorkspaceOwner } = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const { showExternalApiPanel, setShowExternalApiPanel } = useExternalApiPanel()
  const [includeAll, { toggle: toggleIncludeAll }] = useBoolean(false)

  const options = useMemo(() => {
    return [
      { value: 'dataset', text: t('dataset.datasets') },
      ...(currentWorkspace.role === 'dataset_operator' ? [] : [{ value: 'api', text: t('dataset.datasetsApi') }]),
    ]
  }, [currentWorkspace.role, t])

  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'dataset',
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const { data } = useQuery(
    {
      queryKey: ['datasetApiBaseInfo'],
      queryFn: () => fetchDatasetApiBaseUrl('/datasets/api-base-info'),
      enabled: activeTab !== 'dataset',
    },
  )

  const [keywords, setKeywords] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }
  const [tagFilterValue, setTagFilterValue] = useState<string[]>([])
  const [tagIDs, setTagIDs] = useState<string[]>([])
  const { run: handleTagsUpdate } = useDebounceFn(() => {
    setTagIDs(tagFilterValue)
  }, { wait: 500 })
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  useEffect(() => {
    if (currentWorkspace.role === 'normal')
      return router.replace('/apps')
  }, [currentWorkspace, router])

  const [isBuiltInEnabled, setIsBuiltInEnabled] = useState(false)
  const [userMetadata, setUserMetadata] = useState([
    { id: '1', name: 'name1', type: DataType.string, valueLength: 1 },
    { id: '2', name: 'name2', type: DataType.number, valueLength: 2 },
    { id: '3', name: 'name3', type: DataType.time, valueLength: 3 },
  ])

  return (
    <div ref={containerRef} className='grow relative flex flex-col bg-background-body overflow-y-auto scroll-container'>
      <div className='flex justify-end mt-[300px] mr-[100px]'>
        <MetaDataDocument />
        {/* <SelectMetadataModal trigger={<Button className='w-[200px]'>select</Button>} onSave={(data) => { console.log(data) }} />
        <CreateModal trigger={<Button className='w-[200px]'>add</Button>} hasBack onSave={(data) => { console.log(data) }} />
        <Button className='flex w-[200px]' size="medium" onClick={() => setShowExternalApiPanel(true)}>
          Metadata
        </Button> */}
        {/* <DatasetMetadataDrawer
          userMetadata={userMetadata}
          onChange={setUserMetadata}
          builtInMetadata={[
            { id: '1', name: 'name1', type: DataType.string, valueLength: 1 },
            { id: '2', name: 'name2', type: DataType.number, valueLength: 2 },
            { id: '3', name: 'name3', type: DataType.time, valueLength: 3 },
          ]}
          isBuiltInEnabled={isBuiltInEnabled}
          onIsBuiltInEnabledChange={setIsBuiltInEnabled}
          onClose={() => { }}
        /> */}
        {/* <EditMetadataBatchModal
          documentNum={20}
          list={[
            {
              id: '1', name: 'name1', type: DataType.string, value: 'aaa',
            },
            {
              id: '2', name: 'name2', type: DataType.number, value: 'ccc', isMultipleValue: true, isUpdated: true,
            },
            {
              id: '2.1', name: 'num v', type: DataType.number, value: 10,
            },
            {
              id: '3', name: 'name3', type: DataType.time, value: '', isUpdated: true, // updateType: UpdateType.delete,
            },
          ]}
          onHide={() => { }}
          onChange={(list, newList, isApplyToAllSelectDocument) => { console.log(list, newList, isApplyToAllSelectDocument) }}
        /> */}
      </div>
      <div className='sticky top-0 flex justify-between pt-4 px-12 pb-2 leading-[56px] bg-background-body z-10 flex-wrap gap-y-2'>
        <TabSliderNew
          value={activeTab}
          onChange={newActiveTab => setActiveTab(newActiveTab)}
          options={options}
        />
        {activeTab === 'dataset' && (
          <div className='flex items-center justify-center gap-2'>
            {isCurrentWorkspaceOwner && <CheckboxWithLabel
              isChecked={includeAll}
              onChange={toggleIncludeAll}
              label={t('dataset.allKnowledge')}
              labelClassName='system-md-regular text-text-secondary'
              className='mr-2'
              tooltip={t('dataset.allKnowledgeDescription') as string}
            />}
            <TagFilter type='knowledge' value={tagFilterValue} onChange={handleTagsChange} />
            <Input
              showLeftIcon
              showClearIcon
              wrapperClassName='w-[200px]'
              value={keywords}
              onChange={e => handleKeywordsChange(e.target.value)}
              onClear={() => handleKeywordsChange('')}
            />
            <div className="w-[1px] h-4 bg-divider-regular" />
            <Button
              className='gap-0.5 shadows-shadow-xs'
              onClick={() => setShowExternalApiPanel(true)}
            >
              <ApiConnectionMod className='w-4 h-4 text-components-button-secondary-text' />
              <div className='flex px-0.5 justify-center items-center gap-1 text-components-button-secondary-text system-sm-medium'>{t('dataset.externalAPIPanelTitle')}</div>
            </Button>
          </div>
        )}
        {activeTab === 'api' && data && <ApiServer apiBaseUrl={data.api_base_url || ''} />}
      </div>
      {activeTab === 'dataset' && (
        <>
          <Datasets containerRef={containerRef} tags={tagIDs} keywords={searchKeywords} includeAll={includeAll} />
          <DatasetFooter />
          {showTagManagementModal && (
            <TagManagementModal type='knowledge' show={showTagManagementModal} />
          )}
        </>
      )}
      {activeTab === 'api' && data && <Doc apiBaseUrl={data.api_base_url || ''} />}

      {showExternalApiPanel && <ExternalAPIPanel onClose={() => setShowExternalApiPanel(false)} />}
    </div>
  )
}

export default Container
